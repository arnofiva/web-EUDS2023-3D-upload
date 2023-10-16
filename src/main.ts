import Basemap from "@arcgis/core/Basemap";
import WebScene from "@arcgis/core/WebScene";
import { watch } from "@arcgis/core/core/reactiveUtils";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import SceneView from "@arcgis/core/views/SceneView";
import BasemapToggle from "@arcgis/core/widgets/BasemapToggle";
import Editor from "@arcgis/core/widgets/Editor";
import Expand from "@arcgis/core/widgets/Expand";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "@esri/calcite-components/dist/components/calcite-loader";
import MeshModifications from "./MeshModifications";

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

const modelLayer = new SceneLayer({
  title: "3D Models Planned Buildings",
  portalItem: {
    id: "13cc80ec3d85485289448659438abf0c",
  },
  outFields: ["*"],
});

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

  const modifications = new MeshModifications({ view });

  view.ui.add(
    new Expand({
      view,
      expandIcon: "mask-inside",
      content: modifications,
      group: "tools",
    }),
    "top-right"
  );

  const editor = new Editor({
    view,
  });

  editor.viewModel.sketchViewModel.tooltipOptions.enabled = true;

  view.ui.add(
    new Expand({
      view,
      content: editor,
      group: "tools",
    }),
    "top-right"
  );

  window.onkeydown = (e) => {
    const number = Number.parseInt(e.key);
    const slides = map.presentation.slides;
    if (0 < number && number <= slides.length) {
      view.goTo(slides.getItemAt(number - 1).viewpoint, { speedFactor: 0.3 });
    }
  };
});

(window as any)["view"] = view;
