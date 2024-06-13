import { Widget } from "./widgets/Widget";

import "@esri/calcite-components/dist/components/calcite-menu";
import "@esri/calcite-components/dist/components/calcite-menu-item";
import "@esri/calcite-components/dist/components/calcite-navigation";
import "@esri/calcite-components/dist/components/calcite-navigation-logo";
import "@esri/calcite-components/dist/components/calcite-shell";

import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import { watch } from "@arcgis/core/core/reactiveUtils";
import SceneView from "@arcgis/core/views/SceneView";
import BasemapToggle from "@arcgis/core/widgets/BasemapToggle";
import Editor from "@arcgis/core/widgets/Editor";
import { tsx } from "@arcgis/core/widgets/support/widget";
import Navigation, { Viewpoint } from "./Navigation";
import { satelliteBasemap } from "./layers";
import MeshModifications from "./widgets/MeshModifications";

type AppProperties = Pick<App, "view" | "navigation">;

@subclass("euds2023modelupload.App")
class App extends Widget<AppProperties> {
  @property()
  view: SceneView;

  @property()
  navigation: Navigation;

  private _basemapToggle: BasemapToggle;

  private _modifications: MeshModifications;

  private _editor: Editor;

  postInitialize(): void {
    const view = this.view;

    const basemapToggle = (this._basemapToggle = new BasemapToggle({
      view,
      nextBasemap: satelliteBasemap,
    }));

    const modifications = (this._modifications = new MeshModifications({
      view,
      navigation: this.navigation,
    }));
    modifications.visible = false;

    const editor = (this._editor = new Editor({ view }));
    editor.visible = false;
    editor.viewModel.sketchViewModel.tooltipOptions.enabled = true;

    watch(
      () => {
        return editor.viewModel.state;
      },
      (state) => {
        console.log({ state });
      }
    );

    // modelLayer.on("edits", () => {
    //   this._editor.visible = false;
    // });

    view.ui.add([basemapToggle, modifications, editor], "bottom-right");
  }

  private goTo(viewpoint: Viewpoint) {
    this._editor.visible = false;
    this._modifications.visible = false;
    this._basemapToggle.visible = true;
    this.navigation.goTo(viewpoint);
  }

  private flatten() {
    this._editor.visible = false;
    if (this._modifications.visible) {
      this._modifications.visible = false;
      this._basemapToggle.visible = true;
    } else {
      this._modifications.visible = true;
      this._basemapToggle.visible = false;
    }
    this.navigation.goTo(Viewpoint.Flatten);
  }

  private upload() {
    this._modifications.visible = false;
    if (this._editor.visible) {
      this._editor.visible = false;
      this._basemapToggle.visible = true;
    } else {
      this._editor.visible = true;
      this._basemapToggle.visible = false;
    }
    this.navigation.goTo(Viewpoint.Site);
  }

  render() {
    return (
      <calcite-shell>
        <calcite-navigation slot="header">
          <calcite-navigation-logo
            slot="logo"
            heading="3D Upload"
            description="ArcGIS Maps SDK for JavaScript"
            thumbnail="./icon-64.svg"
          ></calcite-navigation-logo>

          <calcite-menu slot="content-center">
            {[Viewpoint.Downtown, Viewpoint.River, Viewpoint.Building].map(
              (viewpoint) => (
                <calcite-button
                  round
                  kind="neutral"
                  // appearance="outline"
                  class="viewpoint-button"
                  onclick={() => this.goTo(viewpoint)}
                >
                  {viewpoint}
                </calcite-button>
              )
            )}
          </calcite-menu>
          <calcite-menu slot="content-end">
            <calcite-menu-item
              active={this._modifications.visible}
              onclick={() => this.flatten()}
              text="Flatten Mesh"
              icon-start="mask-inside"
              text-enabled
            ></calcite-menu-item>
            <calcite-menu-item
              active={this._editor.visible}
              onclick={() => this.upload()}
              text="Upload Building"
              icon-start="upload"
              text-enabled
            ></calcite-menu-item>
          </calcite-menu>
        </calcite-navigation>
      </calcite-shell>
    );
  }
}

export default App;
