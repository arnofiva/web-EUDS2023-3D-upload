import WebScene from "@arcgis/core/WebScene";
import Accessor from "@arcgis/core/core/Accessor";
import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import { waitFor } from "./utils";

type NavigationProperties = Pick<Navigation, "view">;

export enum Viewpoint {
  River = "River",
  Downtown = "Downtown",
  Building = "Building",
  Site = "Site",
  Flatten = "Flatten",
}

@subclass("euds2023modelupload.Navigation")
class Navigation extends Accessor {
  @property()
  view: SceneView;

  @property({ aliasOf: "view.map" })
  map: WebScene;

  private get slides() {
    return this.map.loadAll().then((map) => map.presentation.slides);
  }

  constructor(properties: NavigationProperties) {
    super(properties);
  }

  async goTo(viewpoint: Viewpoint, speedFactor = 0.3, delayInSeconds = 0) {
    const slide = (await this.slides).find(
      (slide) => slide.title.text === viewpoint.valueOf()
    );
    if (slide) {
      if (0 < delayInSeconds) {
        await waitFor(delayInSeconds);
      }
      await this.view.goTo(slide.viewpoint, {
        speedFactor,
      });
    }
  }
}

export default Navigation;
