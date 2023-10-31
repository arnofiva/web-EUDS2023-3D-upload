import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import { Widget } from "./Widget";

import { tsx } from "@arcgis/core/widgets/support/widget";

import Color from "@arcgis/core/Color";
import { once, watch, when } from "@arcgis/core/core/reactiveUtils";
import { Polygon } from "@arcgis/core/geometry";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import SceneModification from "@arcgis/core/layers/support/SceneModification";
import SceneModifications from "@arcgis/core/layers/support/SceneModifications";
import { FillSymbol3DLayer } from "@arcgis/core/symbols";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";
import StylePattern3D from "@arcgis/core/symbols/patterns/StylePattern3D";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import "@esri/calcite-components/dist/components/calcite-block";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-notice";
import "@esri/calcite-components/dist/components/calcite-panel";
import Navigation, { Viewpoint } from "../Navigation";
import { createToggle } from "../snippet";

type MeshModificationsProperties = Pick<
  MeshModifications,
  "view" | "navigation"
>;

@subclass("euds2023modelupload.MeshModifications")
class MeshModifications extends Widget<MeshModificationsProperties> {
  @property()
  view: SceneView;

  @property()
  navigation: Navigation;

  @property()
  updating = false;

  private svm: SketchViewModel;
  private _snippetToggle = createToggle("tooltipCodeSnippet");

  constructor(props: MeshModificationsProperties) {
    super(props);

    const { view } = props;

    const layer = new GraphicsLayer({
      listMode: "hide",
      elevationInfo: {
        mode: "absolute-height",
      },
    });

    this.svm = new SketchViewModel({
      view,
      layer,
      polygonSymbol: new PolygonSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: new Color([140, 248, 70, 0.55]),
            },
            outline: {
              size: 0.5,
              color: new Color([140, 248, 70]),
            },
            pattern: new StylePattern3D({
              style: "forward-diagonal",
            }),
          }),
        ],
      }),
      // polygonSymbol: new PolygonSymbol3D({
      //   symbolLayers: [
      //     new FillSymbol3DLayer({
      //       material: {}
      //     })
      //   ]
      // })
    });

    view.map.add(layer);

    let snippetVisible = false;

    this.addHandles([
      this.svm.on("create", (event) => {
        if (event.state === "complete" || event.state === "cancel") {
          this.svm.update(event.graphic);
          this.updateFromSVM();
        }
      }),
      this.svm.on("update", (event) => {
        if (event.state === "complete") {
          this.updateFromSVM();
        }
      }),
      when(
        () => this.svm.state === "active" && !snippetVisible,
        () => {
          snippetVisible = true;
          this._snippetToggle();
        }
      ),
      watch(
        () => this.visible,
        (visible) => {
          if (!visible) {
            if (snippetVisible) {
              snippetVisible = false;
              this._snippetToggle();
            }
            this.svm.cancel();
          }
          this.svm.layer.visible = visible;
        }
      ),
    ]);
  }

  destroy(): void {
    this.view.map.remove(this.svm.layer);
    this.svm.destroy();
  }

  private async createPolygon() {
    this.svm.create("polygon");
  }

  private async updateFromSVM() {
    this.updating = true;
    const polygons = this.svm.layer.graphics.map((g) => g.geometry as Polygon);

    const mesh = this.view.map.allLayers.find(
      (l) => l.type === "integrated-mesh"
    ) as IntegratedMeshLayer;

    await this.navigation.goTo(Viewpoint.Site, 1, 0.2);

    mesh.modifications = new SceneModifications(
      polygons.map(
        (geometry) =>
          new SceneModification({
            geometry,
            type: "replace",
          })
      )
    );

    const lv = await this.view.whenLayerView(mesh);

    await once(() => !lv.updating);
    this.updating = false;
  }

  render() {
    return (
      <div>
        <calcite-panel
          class="mesh-modifications"
          loading={this.updating}
          heading="Mesh Modifications"
        >
          <calcite-block open>
            <calcite-notice open>
              <div slot="message">
                Create or modify polygon to flatten parts of the mesh.
              </div>
            </calcite-notice>
          </calcite-block>

          <calcite-button
            slot="footer"
            width="full"
            // appearance="outline"
            onclick={() => this.createPolygon()}
          >
            Create
          </calcite-button>
        </calcite-panel>
      </div>
    );
  }
}

export default MeshModifications;
