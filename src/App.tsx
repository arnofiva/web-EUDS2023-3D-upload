import { Widget } from "./Widget";

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
import Editor from "@arcgis/core/widgets/Editor";
import { tsx } from "@arcgis/core/widgets/support/widget";
import MeshModifications from "./MeshModifications";
import Navigation, { Viewpoint } from "./Navigation";
import { modelLayer } from "./layers";

type AppProperties = Pick<App, "view" | "navigation">;

@subclass("euds2023modelupload.App")
class App extends Widget<AppProperties> {
  @property()
  view: SceneView;

  @property()
  navigation: Navigation;

  private _modifications: MeshModifications;

  private _editor: Editor;

  postInitialize(): void {
    const view = this.view;
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

    modelLayer.on("edits", () => {
      this._editor.visible = false;
    });

    view.ui.add([modifications, editor], "top-right");
  }

  private flatten() {
    this._editor.visible = false;
    this._modifications.visible = !this._modifications.visible;
    this.navigation.goTo(Viewpoint.Flatten);
  }

  private upload() {
    this._editor.visible = !this._editor.visible;
    this._modifications.visible = false;
    this.navigation.goTo(Viewpoint.Upload);
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
          <calcite-menu slot="content-end">
            <calcite-menu-item
              active={this._modifications.visible}
              onclick={() => this.navigation.goTo(Viewpoint.Downtown)}
              text="Downtown"
              // icon-start="road-sign"
              text-enabled
            ></calcite-menu-item>
            <calcite-menu-item
              active={this._modifications.visible}
              onclick={() => this.flatten()}
              text="Flatten Mesh"
              // icon-start="road-sign"
              text-enabled
            ></calcite-menu-item>
            <calcite-menu-item
              active={this._editor.visible}
              onclick={() => this.upload()}
              text="Upload Building"
              // icon-start="snow"
              text-enabled
            ></calcite-menu-item>
          </calcite-menu>
        </calcite-navigation>
      </calcite-shell>
    );
  }
}

export default App;
