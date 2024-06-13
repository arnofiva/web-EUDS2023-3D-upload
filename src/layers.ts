import Basemap from "@arcgis/core/Basemap";
import SceneLayer from "@arcgis/core/layers/SceneLayer";

export const modelLayer = new SceneLayer({
  title: "3D Models Planned Buildings",
  portalItem: {
    id: "1944f82159184ad0aada707a3e268bf9",
  },
  outFields: ["*"],
});

export const satelliteBasemap = Basemap.fromId("satellite");
