import {Wrapper} from '@googlemaps/react-wrapper';
import PropTypes from 'prop-types';

import Map from '../UI/Map/Map';
import GameUI from '../GameUI/GameUI';

import spbw from '../../utils/spbw';

import guessPin from '../../assets/img/guess-pin.png';

import storageConfig from '../../config/storage.json';
import eventConfig from '../../config/events.json';
import api from '../../config/api';
import { useJapanRegion } from '../../utils/japan';
import { useEffect,useState } from 'react';

function GameUiGoogle({ classNames, getParams, utils, realPos, guessPos, markers, setGuessPos, setGameEnd }) {
    const [label, setLabel] = useState({region: ''});
    const {isLoaded,loadPref,getRegionPolygonPaths,getRegionName} = useJapanRegion();
    
    useEffect(() => {
        loadPref()
    },[loadPref]);

    useEffect(() => {
        getRegionName(getParams.region,getParams.town).then(name=>{
            setLabel({
                region: name,
            });
        });
    },[getParams.region,getRegionName]);

    if(!isLoaded) return null;
    return (
        <GameUI
            className={classNames?.game_ui}
            utils={utils}
            minimap={{
                children: <Wrapper apiKey={api.googleMapsApiKey}>
                    <Map
                        className={spbw(classNames?.minimap, classNames?.place_point)}
                        options={{
                            center: {lat: 0, lng: 0},
                            minZoom: 2,
                            zoom: 2,
                            disableDefaultUI: true,
                            mapTypeControl: true,
                            zoomControl: true,
                            controlSize: 30
                        }}
                        onMount={map => {
                            
                            getRegionPolygonPaths(getParams.region).then(geometry=>{
                                if(!geometry) return;
                                const bounds = new window.google.maps.LatLngBounds();
                                geometry.forEach(path=>{
                                    path.forEach(coord=>{
                                        bounds.extend(coord);
                                    })
                                })
                                map.fitBounds(bounds);
                            });

                            map.addListener('click', evt => {
                                const pos = evt.latLng;
                                markers.removeAllPins();
                                markers.placePin(map, pos, guessPin);
                                setGuessPos([+pos.lat(), +pos.lng()]);
                            });
                        }}
                    />
                </Wrapper>,
                guessDisabled: !guessPos,
                onGuess() {
                    if (!realPos.current || !window.confirm('Are you sure?')) return;
                    clearInterval(utils.timer.itvId);

                    utils.timer.gts = Date.now();

                    const last = JSON.parse(localStorage.getItem(storageConfig.hist) || '[]');
                    const params = JSON.parse(localStorage.getItem(storageConfig.pref) || '{}');
                    if (!params.pauseProgress) localStorage.setItem(storageConfig.hist, JSON.stringify([...last, {
                        rg: getParams.region,
                        gp: guessPos,
                        rp: realPos.current,
                        tm: utils.timer.time,
                        dt: utils.timer.gts
                    }]));

                    window.onbeforeunload = null;
                    setGameEnd(true);
                }
            }}
            buttonEvents={{
                quit() {
                    window.dispatchEvent(new CustomEvent(eventConfig.gQuit));
                },
                goToStart() {
                    if (!realPos.current) return;
                    window.dispatchEvent(new CustomEvent(eventConfig.gGoToStart));
                },
                zoomIn() {
                    if (!realPos.current) return;
                    window.dispatchEvent(new CustomEvent(eventConfig.gZoomIn));
                },
                zoomOut() {
                    if (!realPos.current) return;
                    window.dispatchEvent(new CustomEvent(eventConfig.gZoomOut));
                },
                eject() {
                    if (!realPos.current) return;
                    window.dispatchEvent(new CustomEvent(eventConfig.gEject));
                }
            }}
            infoData={label}
        />
    );
}
GameUiGoogle.propTypes = {
    classNames: PropTypes.object.isRequired,
    getParams: PropTypes.object.isRequired,
    utils: PropTypes.object.isRequired,
    realPos: PropTypes.object.isRequired,
    guessPos: PropTypes.array,
    markers: PropTypes.object.isRequired,
    setGuessPos: PropTypes.func.isRequired,
    setGameEnd: PropTypes.func.isRequired
};

export default GameUiGoogle;
