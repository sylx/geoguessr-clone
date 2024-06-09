import React, { useEffect, useRef } from "react";
import Map from "../UI/Map/Map";
import cls from './enter-game.module.css';

export function MapRegion({geometry}:{geometry: google.maps.LatLng[][]}) {
    const [map, setMap] = React.useState<google.maps.Map | null>(null);
    const polygons = useRef<google.maps.Polygon[]>([]);


    const onMount = (map: google.maps.Map) => {
        setMap(map);
    }

    useEffect(()=>{
        if(!map) return;
        // clear all polygons
        polygons.current.forEach(polygon=>polygon.setMap(null));

        const bounds = new google.maps.LatLngBounds();
        geometry.forEach(path=>{        
            polygons.current.push(new google.maps.Polygon({
                    paths: path,
                    strokeColor: "#FF0000",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#FF0000",
                    fillOpacity: 0.35,
                    map
            }))
            path.forEach(coord=>{
                bounds.extend(coord);
            })
        })
        map.fitBounds(bounds);
    },[map,geometry])

    return (
        <Map 
            className={cls.minimap}
            options={{
                center: {lat: 0, lng: 0},
                minZoom: 1,
                zoom: 1,
                disableDefaultUI: true
            }}
            onMount={onMount}
        />
    );
}