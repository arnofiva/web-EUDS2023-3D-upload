import Color from "@arcgis/core/Color";
import WebScene from "@arcgis/core/WebScene";
import { watch } from "@arcgis/core/core/reactiveUtils";
import SceneView from "@arcgis/core/views/SceneView";
import Daylight from "@arcgis/core/widgets/Daylight";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";
import App from "./App";
import Navigation from "./Navigation";
import { modelLayer, satelliteBasemap } from "./layers";

// setAssetPath("https://js.arcgis.com/calcite-components/1.0.0-beta.77/assets");

// const params = new URLSearchParams(document.location.search.slice(1));
// const someParam = params.has("someParam");

export const themeColor = new Color([61, 77, 228]);
export const highlightColor = new Color([228, 61, 228]);

// IdentityManager.registerOAuthInfos([
//   new OAuthInfo({
//     appId: "KojZjH6glligLidj",
//     popup: true,
//     popupCallbackUrl: `${document.location.origin}${document.location.pathname}oauth-callback-api.html`,
//   }),
// ]);

// (window as any).setOAuthResponseHash = (responseHash: string) => {
//   IdentityManager.setOAuthResponseHash(responseHash);
// };

const map = new WebScene({
  portalItem: {
    id: "5c89bee43fc448ddab5a7bfb3d4e11d7",
  },
  layers: [modelLayer],
});

const view = new SceneView({
  qualityProfile: "high",
  container: "viewDiv",
  map,
  // theme: {
  //   // accentColor: new Color([140, 248, 70]),
  //   accentColor: highlightColor,
  //   textColor: themeColor,
  // },
  highlightOptions: {
    // color: new Color([140, 248, 70]),
    color: themeColor,
    fillOpacity: 0,
    // haloColor: new Color([140, 248, 70]),
    haloColor: themeColor,
    haloOpacity: 1,
    shadowColor: highlightColor,
    shadowOpacity: 0.9,
    shadowDifference: 0.7,
  },
});

view.popup.dockEnabled = true;
view.popup.dockOptions = {
  position: "bottom-left",
};

const daylight = new Daylight({
  visible: false,
  view,
});

view.ui.add(daylight, "bottom-left");

watch(
  () => view.popup?.visible,
  (visible) => {
    daylight.visible = visible;
  }
);

const navigation = new Navigation({ view });

const app = new App({
  container: "app",
  view,
  navigation,
});

view.when().then(async () => {
  await map.loadAll();

  const context = view.map.allLayers.find(
    (l) => l.title === "Realistic Context"
  );

  watch(
    () => view.map.basemap,
    (basemap) => {
      context.visible = basemap === satelliteBasemap;
    }
  );
});

(window as any)["view"] = view;
