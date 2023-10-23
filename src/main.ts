import WebScene from "@arcgis/core/WebScene";
import { watch } from "@arcgis/core/core/reactiveUtils";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import SceneView from "@arcgis/core/views/SceneView";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";
import App from "./App";
import Navigation from "./Navigation";
import { modelLayer, satelliteBasemap } from "./layers";

// setAssetPath("https://js.arcgis.com/calcite-components/1.0.0-beta.77/assets");

// const params = new URLSearchParams(document.location.search.slice(1));
// const someParam = params.has("someParam");

IdentityManager.registerOAuthInfos([
  new OAuthInfo({
    appId: "KojZjH6glligLidj",
    popup: true,
    popupCallbackUrl: `${document.location.origin}${document.location.pathname}oauth-callback-api.html`,
  }),
]);

(window as any).setOAuthResponseHash = (responseHash: string) => {
  IdentityManager.setOAuthResponseHash(responseHash);
};

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
});

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
