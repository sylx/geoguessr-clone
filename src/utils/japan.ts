import { useCallback, useState } from "react";
import * as turf from "@turf/turf";

export function useJapanRegion() {
  const [prefData, setPrefData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const prefUrl = "/data/pref.geojson";

  const getPrefCode = (prefName: string) => {
    return prefName.substring(0, 2);
  }
  const loadPref = async () => {
    const res = await fetch(prefUrl);
    const data = await res.json();
    setPrefData(data);
    setIsLoaded(true);
    return data;
  };
  const getPrefNames = () => {
    if (!prefData) return [];
    return prefData.features
        .sort((a: any,b:any)=>parseInt(a.properties.adm_code) - parseInt(b.properties.adm_code))
        .map((feature: any) => [getPrefCode(feature.properties.adm_code), feature.properties.nam_ja]);
  };
  const getRegionNames = async (prefCode: string) => {
    const options = [
        ["all", "全域"],
        ["bigpop", "ランダム（人口多）"],
        ["smallpop", "ランダム（人口少）"]
    ];
    if(prefCode === "00") return options;
    const rest = await fetch(`/data/town/${prefCode}.geojson`);
    const data = await rest.json();
    data.features
        .sort((a: any,b:any)=>parseInt(a.properties.adm_code) - parseInt(b.properties.adm_code))
        .map((feature: any) => [feature.properties.adm_code, feature.properties.laa_ja]).forEach(option=>options.push(option));
    console.log(options)
    return options;
  };

  const getRegionPolygonPaths = async (prefCode: string,detailCode: string = "all") => {
    if (!prefData) return null;
    if(detailCode.match(/(all|bigpop|smallpop)/)){
        const feature = prefData.features.find((feature: any) => getPrefCode(feature.properties.adm_code) === prefCode);
        if (!feature) return null;
        return geometryToPolygonPaths(feature.geometry);
    } else {
        const regionData = await fetch(`/data/town/${prefCode}.geojson`).then(res => res.json());
        const feature = regionData.features.find((feature: any) => feature.properties.adm_code === detailCode);
        if (!feature) return null;
        return geometryToPolygonPaths(feature.geometry);
    }
  };
  const getPrefGeometry = (prefName: string) => {
    if (!prefData) return null;
    const feature = prefData.features.find((feature: any) => feature.properties.nam === prefName);
    if (!feature) return null;
    return feature.geometry;
  };

  // geojsonのgeometryをgoogle.maps.polygonのpath[]に変換
  const geometryToPolygonPaths = (geometry: any) => {
    const toPolygon = (coords: any) => {
      return coords.map((coord: any) => ({ lat: coord[1], lng: coord[0] }));
    };
    if (geometry.type === "Polygon") {
      return [toPolygon(geometry.coordinates[0])];
    } else if (geometry.type === "MultiPolygon") {
      return geometry.coordinates.map((coords: any) => toPolygon(coords[0]));
    } else {
      throw new Error("Invalid geometry type");
    }
  };
  const getRandomCoords = (geometry: any) => {
    if (!geometry) return null;
    //turf.jsを使ってランダムな座標を取得
    let polygon: any;
    if (geometry.type === "MultiPolygon") {
      //複数のポリゴンがある場合は一つのポリゴンを選択して、turf.polygonsに変換
      const key = Math.floor(Math.random() * geometry.coordinates.length);
      polygon = turf.polygon(geometry.coordinates[key]);
    } else {
      polygon = turf.polygon(geometry.coordinates);
    }

    const bbox = turf.bbox(polygon);
    let randomPoint: [number, number];
    //領域内にはいるまで繰り返す
    do {
      randomPoint = turf.randomPosition(bbox) as [number, number];
    } while (!turf.booleanPointInPolygon(turf.point(randomPoint), polygon));
    return randomPoint.reverse();
  };

  return {
    isLoaded,
    getPrefNames: useCallback(getPrefNames, [prefData]),
    getRegionNames: useCallback(getRegionNames, []),
    getPrefGeometry: useCallback(getPrefGeometry, [prefData]),
    getRegionPolygonPaths: useCallback(getRegionPolygonPaths, [prefData]),
    loadPref: useCallback(loadPref, [prefUrl]),
    getRandomCoords: useCallback(getRandomCoords, []),
  };
}
