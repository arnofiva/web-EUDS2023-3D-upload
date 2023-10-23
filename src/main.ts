import Basemap from "@arcgis/core/Basemap";
import WebScene from "@arcgis/core/WebScene";
import { watch, whenOnce } from "@arcgis/core/core/reactiveUtils";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import SceneView from "@arcgis/core/views/SceneView";
import BasemapToggle from "@arcgis/core/widgets/BasemapToggle";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";
import App from "./App";
import Navigation, { Viewpoint } from "./Navigation";
import { modelLayer } from "./layers";

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
    id: "a9c70ea3045e4c04a31e8a8db7f9b6ce",
  },
  layers: [modelLayer],
});

const view = new SceneView({
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

  const mesh = map.allLayers.find(
    (l) => l.type === "integrated-mesh"
  ) as IntegratedMeshLayer;

  const satelliteBasemap = Basemap.fromId("satellite");

  const basemapToggle = new BasemapToggle({
    view,
    nextBasemap: satelliteBasemap,
  });

  view.ui.add(basemapToggle, "bottom-right");

  watch(
    () => view.map.basemap,
    (basemap) => {
      mesh.visible = basemap === satelliteBasemap;
    }
  );

  await whenOnce(() => view.map.basemap === satelliteBasemap);

  navigation.goTo(Viewpoint.Downtown, 5);
});

(window as any)["view"] = view;
