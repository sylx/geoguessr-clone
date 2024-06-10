import PropTypes from 'prop-types';
import {Wrapper} from '@googlemaps/react-wrapper';

import GameResults from '../GameResults/GameResults';
import Map from '../UI/Map/Map';

import arrToLLObj from '../../utils/arr-to-ll-obj';
import geoUrl from '../../utils/geo-url';

import guessPin from '../../assets/img/guess-pin.png';
import realPin from '../../assets/img/real-pin.png';

import api from '../../config/api';
import { useEffect,useState } from 'react';
import { useJapanRegion } from '../../utils/japan';

function GameResultsGoogle({ classNames, getParams, utils, realPos, guessPos, markers }) {
    const [info, setInfo] = useState(null);
    const { loadPref,getRegionInfo,setRegionBoundsToMap } = useJapanRegion();
    useEffect(() => {
        console.log("come")
        loadPref().then(()=>getRegionInfo(getParams.region,getParams.town)).then(info => {
            setInfo(info)
            console.log("info",info)
        });
    },[])

    return (
        <GameResults
            getParams={getParams}
            info={info}
            data={{
                region: getParams.region,
                realPos: realPos.current,
                time: utils.timer.time,
                guessPos
            }}
            map={<Wrapper apiKey={api.googleMapsApiKey}>
                { info && <Map
                    className={classNames.minimap}
                    options={{
                        center: {lat: 0, lng: 0},
                        minZoom: 1,
                        zoom: 1,
                        disableDefaultUI: true
                    }}
                    onMount={async map => {
                        markers.removeAllPins();
                        markers.placePin(map, arrToLLObj(guessPos), guessPin, geoUrl(guessPos));
                        markers.placePin(map, arrToLLObj(realPos.current), realPin, geoUrl(realPos.current));
                        await setRegionBoundsToMap(map, "00","all")

                        let mapLoaded = false;

                        map.addListener('tilesloaded', () => {
                            if (mapLoaded) return;
                            setTimeout(() => {
                                const bounds = new window.google.maps.LatLngBounds();
                                markers.getMarkers().forEach(m => bounds.extend(m.position));
                                map.fitBounds(bounds);
                            }, 1000);
                            mapLoaded = true;
                        });
                    }}
                /> }
            </Wrapper>}
        />
    );
}
GameResultsGoogle.propTypes = {
    classNames: PropTypes.object.isRequired,
    getParams: PropTypes.object.isRequired,
    utils: PropTypes.object.isRequired,
    realPos: PropTypes.object.isRequired,
    guessPos: PropTypes.array.isRequired,
    markers: PropTypes.object.isRequired
};

export default GameResultsGoogle;
