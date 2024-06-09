import { useCallback, useState } from "react"
import turf from "@turf/turf"

export function useJapanRegion(){
    const [prefData,setPrefData] = useState<any>(null)
    const [isLoaded,setIsLoaded] = useState(false)

    const prefUrl="/data/pref.geojson"
    const loadPref = async ()=>{
        const res = await fetch(prefUrl)
        const data = await res.json()
        setPrefData(data)
        setIsLoaded(true)
        return data
    }
    const getPrefNames = ()=>{
        if(!prefData) return []
        return prefData.features.map((feature:any)=>[feature.properties.nam,feature.properties.nam]);
    }
    const getPrefGeometry = (prefName:string)=>{
        if(!prefData) return null
        const feature = prefData.features.find((feature:any)=>feature.properties.nam===prefName)
        if(!feature) return null
        return geometryToPolygonPaths(feature.geometry)
    }

    // geojsonのgeometryをgoogle.maps.polygonのpath[]に変換
    const geometryToPolygonPaths = (geometry:any)=>{
        const toPolygon = (coords:any)=>{
            return coords.map((coord:any)=>({lat:coord[1],lng:coord[0]}))
        }
        if(geometry.type==="Polygon"){
            return [toPolygon(geometry.coordinates[0])]
        }else if(geometry.type==="MultiPolygon"){
            return geometry.coordinates.map((coords:any)=>toPolygon(coords[0]))
        }else{
            throw new Error("Invalid geometry type")
        }
    }

    return {
        isLoaded,
        getPrefNames: useCallback(getPrefNames,[prefData]),
        getPrefGeometry: useCallback(getPrefGeometry,[prefData]),
        loadPref: useCallback(loadPref,[prefUrl])
    }
}