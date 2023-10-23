import Basemap from "@arcgis/core/Basemap";
import SceneLayer from "@arcgis/core/layers/SceneLayer";

export const modelLayer = new SceneLayer({
  title: "3D Models Planned Buildings",
  portalItem: {
    id: "13cc80ec3d85485289448659438abf0c",
  },
  outFields: ["*"],
});

export const satelliteBasemap = Basemap.fromId("satellite");
