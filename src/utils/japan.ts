import { useCallback, useState } from "react"
import turf from "@turf/turf"

export function useJapanRegion(){
    const [prefData,setPrefData] = useState<any>(null)
    const prefUrl="/data/pref.geojson"
    const loadPref = async ()=>{
        const res = await fetch(prefUrl)
        const data = await res.json()
        setPrefData(data.features.map((feature:any)=>feature.properties.nam))
        return data
    }

    return {
        prefData,
        loadPref: useCallback(loadPref,[prefUrl])
    }
}