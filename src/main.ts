import distance from "@turf/distance";
import maplibregl from "maplibre-gl";
import OpacityControl from "maplibre-gl-opacity";
import "maplibre-gl/dist/maplibre-gl.css";

const map = new maplibregl.Map({
  container: "map", // container id
  zoom: 1, // starting zoom
  center: [138, 37], // starting position [lng, lat]
  minZoom: 5,
  maxZoom: 18,
  maxBounds: [122, 20, 154, 50],
  style: {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        maxzoom: 19,
        tileSize: 256,
        attribution: "&copy; OpenStreetMap",
      },
      // hazard_flood: {
      //   type: "raster",
      //   tiles: [
      //     "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png",
      //   ],
      //   minzoom: 2,
      //   maxzoom: 17,
      //   tileSize: 256,
      //   attribution: "ハザードマップポータルサイト",
      // },
      // hazard_hightide: {
      //   type: "raster",
      //   tiles: [
      //     "https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png",
      //   ],
      //   minzoom: 2,
      //   maxzoom: 17,
      //   tileSize: 256,
      //   attribution: "ハザードマップポータルサイト",
      // },
      hazard_tsunami: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution: "ハザードマップポータルサイト",
      },
      hazard_doseki: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution: "ハザードマップポータルサイト",
      },
      hazard_kyukeisha: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution: "ハザードマップポータルサイト",
      },
      hazard_jisuberi: {
        type: "raster",
        tiles: [
          "https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png",
        ],
        minzoom: 2,
        maxzoom: 17,
        tileSize: 256,
        attribution: "ハザードマップポータルサイト",
      },
      skhb: {
        type: "vector",
        tiles: [
          `${location.href.replace("/index.html", "")}/skhb/{z}/{x}/{y}.pbf`,
        ],
        minzoom: 5,
        maxzoom: 8,
        attribution: "緊急避難場所データ",
      },
      route: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      },
    },
    layers: [
      {
        id: "osm-layer",
        source: "osm",
        type: "raster",
      },
      // {
      //   id: "hazard_flood-layer",
      //   source: "hazard_flood",
      //   type: "raster",
      //   paint: { "raster-opacity": 0.7 },
      //   layout: { visibility: "none" },
      // },
      // {
      //   id: "hazard_hightide-layer",
      //   source: "hazard_hightide",
      //   type: "raster",
      //   paint: { "raster-opacity": 0.7 },
      //   layout: { visibility: "none" },
      // },
      {
        id: "hazard_tsunami-layer",
        source: "hazard_tsunami",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "hazard_doseki-layer",
        source: "hazard_doseki",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "hazard_kyukeisha-layer",
        source: "hazard_kyukeisha",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "hazard_jisuberi-layer",
        source: "hazard_jisuberi",
        type: "raster",
        paint: { "raster-opacity": 0.7 },
        layout: { visibility: "none" },
      },
      {
        id: "skhb-layer",
        source: "skhb",
        "source-layer": "skhb",
        type: "circle",
        paint: {
          "circle-color": "#6666cc",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 14, 6],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
        // filter: ["get", "disaster4"], // なぜかフィルタできず、何も表示されなくなってしまう…
      },
      {
        id: "route-layer",
        source: "route",
        type: "line",
        paint: {
          "line-color": "#33aaff",
          "line-width": 4,
        },
      },
    ],
  },
});

const getNearestFeature = (longtitude: number, latitude: number) => {
  const features = map.querySourceFeatures("skhb", {
    sourceLayer: "skhb",
  });

  const nearestFeature = features.reduce((minDistFeature, feature) => {
    const dist = distance([longtitude, latitude], feature.geometry.coordinates);
    if (minDistFeature === null || minDistFeature.properties.dist > dist) {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          dist,
        },
      };
    }

    return minDistFeature;
  }, null);

  return nearestFeature;
};

map.on("load", () => {
  const opacity = new OpacityControl({
    baseLayers: {
      // "hazard_flood-layer": "洪水浸水想定区域",
      // "hazard_hightide-layer": "高潮浸水想定区域",
      "hazard_tsunami-layer": "津波浸水想定区域",
      "hazard_doseki-layer": "土石流警戒区域",
      "hazard_kyukeisha-layer": "急傾斜警戒区域",
      "hazard_jisuberi-layer": "地滑り警戒区域",
    },
  });
  map.addControl(opacity, "top-left");

  map.on("click", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["skhb-layer"],
    });
    if (features.length === 0) return;

    const feature = features[0];
    console.log(feature);
    const popup = new maplibregl.Popup()
      .setLngLat(feature.geometry.coordinates) // コンパイルエラーになってるが動く。型を誤認している？
      .setHTML(
        `\
      <div>${feature.properties.name}</div>`
      )
      .addTo(map);
  });

  map.on("mousemove", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["skhb-layer"],
    });

    if (features.length > 0) {
      map.getCanvas().style.cursor = "pointer";
    } else {
      map.getCanvas().style.cursor = "";
    }
  });

  let userLocation = null;
  const geolocationControl = new maplibregl.GeolocateControl({
    trackUserLocation: true,
  });
  map.addControl(geolocationControl, "bottom-right");
  geolocationControl.on("geolocate", (e) => {
    userLocation = [e.coords.longitude, e.coords.latitude];
  });

  map.on("render", () => {
    if (geolocationControl._watchState === "OFF") userLocation = null;

    if (map.getZoom() < 7 || userLocation === null) return;

    // console.log("hoge");

    const nearestFeature = getNearestFeature(userLocation[0], userLocation[1]);

    const routeFeature = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [userLocation, nearestFeature._geometry.coordinates],
      },
    };
    // console.log(routeFeature);
    map.getSource("route")?.setData({
      type: "FeatureCollection",
      features: [routeFeature],
    });
  });
});
