import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import { Widget } from "./Widget";

import { tsx } from "@arcgis/core/widgets/support/widget";

import { once } from "@arcgis/core/core/reactiveUtils";
import { Polygon } from "@arcgis/core/geometry";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import SceneModification from "@arcgis/core/layers/support/SceneModification";
import SceneModifications from "@arcgis/core/layers/support/SceneModifications";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import "@esri/calcite-components/dist/components/calcite-block";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-notice";
import "@esri/calcite-components/dist/components/calcite-panel";

type MeshModificationsProperties = Pick<MeshModifications, "view">;

@subclass("euds2023modelupload.MeshModifications")
class MeshModifications extends Widget<MeshModificationsProperties> {
  @property()
  view: SceneView;

  @property()
  updating = false;

  private svm: SketchViewModel;

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
      // polygonSymbol: new PolygonSymbol3D({
      //   symbolLayers: [
      //     new FillSymbol3DLayer({
      //       material: {}
      //     })
      //   ]
      // })
    });

    view.map.add(layer);

    this.addHandles([
      this.svm.on("create", (event) => {
        if (event.state === "complete" || event.state === "cancel") {
          this.updateFromSVM();
        }
      }),
      this.svm.on("update", (event) => {
        if (event.state === "complete") {
          this.updateFromSVM();
        }
      }),
    ]);
  }

  private async createPolygon() {
    this.svm.create("polygon");
  }

  private async updateFromSVM() {
    const polygons = this.svm.layer.graphics.map((g) => g.geometry as Polygon);

    const mesh = this.view.map.allLayers.find(
      (l) => l.type === "integrated-mesh"
    ) as IntegratedMeshLayer;

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

    this.updating = true;
    await once(() => !lv.updating);
    this.updating = false;
  }

  render() {
    return (
      <calcite-panel
        class="mesh-modifications"
        loading={this.updating}
        heading="Mesh Modifications"
      >
        <calcite-block open>
          <calcite-notice open>
            <div slot="message">Step 1: Create a polygon</div>
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
    );
  }
}

export default MeshModifications;