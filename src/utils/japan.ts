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
    if(prefData) return prefData;
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
        ["all", "ランダム(全域)"],
        ["highpop", "ランダム（人口多）"],
        ["lowpop", "ランダム（人口少）"]
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
    if(detailCode.match(/(all|highpop|lowpop)/)){
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
  const getRegionInfo = async (prefCode: string,detailCode: string) => {
    let name = "";
    if(!prefData) throw new Error("prefData is not loaded");
    if(detailCode.match(/(all|highpop|lowpop)/)){
        const feature = prefData.features.find((feature: any) => getPrefCode(feature.properties.adm_code) === prefCode);
        if (!feature) return null;
        name = feature.properties.nam_ja
    } else {
        const regionData = await fetch(`/data/town/${prefCode}.geojson`).then(res => res.json());
        const feature = regionData.features.find((feature: any) => feature.properties.adm_code === detailCode);
        if (!feature) return null;
        name = feature.properties.nam_ja + feature.properties.laa_ja
    }
    const geometry = await getRegionGeometry(prefCode,detailCode);
    //bboxの対角線の長さを計算
    const bbox = turf.bbox(geometry);
    const diagonal = turf.distance(bbox.slice(0, 2), bbox.slice(2, 4), { units: "meters" });
    return {
      name,
      longest: diagonal / (prefCode === "00" ? 16 : 4), //日本全国だと当てずっぽうでも高得点になるので、短くする
    }
  }

  const setRegionBoundsToMap= async (map: google.maps.Map, prefCode: string,detailCode: string) =>{
    const paths = await getRegionPolygonPaths(prefCode,detailCode);
    if (!paths) return;
    const bounds = new google.maps.LatLngBounds();
    paths.forEach(path=>{
        path.forEach(coord=>{
            bounds.extend(coord);
        })
    })
    map.fitBounds(bounds);
  }
  
  const getRegionGeometry = async (prefCode: string,detailCode: string) => {
    const url = prefCode === "00" ? "/data/pref.geojson" : `/data/town/${prefCode}.geojson`;
    const regionData = await fetch(url).then(res => res.json());
    let turfShape : any
    if(detailCode === "all"){
        const feature = prefData.features.find((feature: any) => getPrefCode(feature.properties.adm_code) === prefCode);
        if (!feature) throw new Error("Invalid pref code");
        turfShape = geometryToTurfShape(feature.geometry);
    }else if(detailCode === "highpop" || detailCode === "lowpop"){
        // ランダムで人口が多い地域を当たりやすくしつつgeometryを取得
        const total_population = regionData.features.reduce((acc: number, feature: any) => acc + Math.max(feature.properties.pop,0), 0);
        const random = Math.random() * total_population * (detailCode === "highpop" ?  0.3 : 0.1);
        let sum = 0;
        let count = 0;
        const sorted = regionData.features.sort((a: any,b: any)=>Math.max(b.properties.pop,0) - Math.max(a.properties.pop,0));
        if(detailCode === "lowpop") sorted.reverse();      
        for(const feature of sorted){
            //console.log(feature.properties.nam_ja,feature.properties.laa_ja,feature.properties.pop)
            count++;
            sum += Math.max(feature.properties.pop,0);
            if(sum >= random){
                //console.log("random",random,"sum",sum,"pop",feature.properties.pop,"count",count);
                turfShape = geometryToTurfShape(feature.geometry);
                break;
            }
        }
    }else{
        const feature = regionData.features.find((feature: any) => feature.properties.adm_code === detailCode);
        if (!feature) return null;
        turfShape = geometryToTurfShape(feature.geometry);
    }
    return turfShape.geometry;
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
  const geometryToTurfShape = (geometry: any) => {
    if (geometry.type === "Polygon") {
      return turf.polygon(geometry.coordinates);
    } else if (geometry.type === "MultiPolygon") {
      return turf.multiPolygon(geometry.coordinates);
    } else {
      throw new Error("Invalid geometry type");
    }
  }
  const getRandomCoords = (geometry: any) => {
    if (!geometry) return null;
    // ポリゴン内部のランダムな点を生成する関数
    function getRandomPointInPolygon(polygon) {
        const bbox = turf.bbox(polygon); // 境界ボックスを取得
        const points = turf.randomPoint(1, { bbox: bbox });
        const point = points.features[0].geometry
        if(turf.booleanPointInPolygon(point, polygon)) {
          return point.coordinates;
        }
        return getRandomPointInPolygon(polygon);  
    }
    const coords=getRandomPointInPolygon(geometry);
    return coords.reverse();
  }


  return {
    isLoaded,
    getPrefNames: useCallback(getPrefNames, [prefData]),
    getRegionNames: useCallback(getRegionNames, []),
    getRegionInfo: useCallback(getRegionInfo, [prefData]),
    getRegionGeometry: useCallback(getRegionGeometry, [prefData]),
    getRegionPolygonPaths: useCallback(getRegionPolygonPaths, [prefData]),
    setRegionBoundsToMap: useCallback(setRegionBoundsToMap, [prefData]),
    loadPref: useCallback(loadPref, [prefUrl]),
    getRandomCoords: useCallback(getRandomCoords, []),
  };
}
