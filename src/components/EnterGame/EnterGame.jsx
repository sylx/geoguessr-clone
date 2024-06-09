import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

import Dropdown from '../UI/Dropdown/Dropdown';
import Button from '../UI/Button/Button';
import Checkbox from '../UI/Checkbox/Checkbox';

import spbw from '../../utils/spbw';

import gameConfig from '../../config/game.json';
import cls from './enter-game.module.css';
import { useJapanRegion } from '../../utils/japan';
import { MapRegion } from './MapRegion';
import { Wrapper } from '@googlemaps/react-wrapper';
import api from '../../config/api';

function EnterGame({ className }) {
    const [pressTimeout, setPressTimeout] = useState(-1);
    const [prefOpened, setPrefOpened] = useState(false);
    const [expOpened, setExpOpened] = useState(false);
    const [geometry, setGeometry] = useState([]);
    const [regionNames, setRegionNames] = useState([]);
    const {isLoaded,getPrefNames,getRegionNames,getRegionPolygonPaths,loadPref} = useJapanRegion();

    useEffect(() => {
        loadPref()
    },[loadPref]);

    useEffect(() => {
        const prefNames = getPrefNames();
        if(prefNames.length>0){
            const firstPref = prefNames[0][0]
            getRegionPolygonPaths(firstPref).then(paths=>{
                if(paths){
                    getRegionNames(firstPref).then(regionNames=>
                        setRegionNames(regionNames)
                    );
                    setGeometry(paths);
                    console.log("Region changed to",firstPref)
                }
            });
        }        
    },[getPrefNames]);

    const prefBtnDown = () => {
        setPressTimeout(setTimeout(() => {
            if (expOpened) return;
            setExpOpened(true);
            setPressTimeout(-1);
        }, 2000));
    };
    const prefBtnClick = evt => {
        clearTimeout(pressTimeout);
        if (pressTimeout + 1) {
            if (prefOpened) {
                setPrefOpened(false);
                setExpOpened(false);
            } else setPrefOpened(true);
        }
        evt.preventDefault();
    };

    const onChangePrefecture = async (evt) => {
        const paths=await getRegionPolygonPaths(evt.target.value);
        if(paths){
            const regionNames = await getRegionNames(evt.target.value);
            setRegionNames(regionNames);
            setGeometry(paths);
        }else{
            throw new Error("Region not found");
        }
    }

    const onChangeTown = async (evt) => {
        // get form element
        const formEl = evt.target.form;
        const regionValue = formEl.querySelector("[name=region]").value
        const paths=await getRegionPolygonPaths(regionValue,evt.target.value);
        if(paths){
            setGeometry(paths);
        }else{
            throw new Error("Region not found");
        }

    }

    if (!isLoaded) return null;

    return (
        <div className={spbw(cls.enter_game, className)}>            
            <form action="/game" method="get">
                { isLoaded && (
                <Dropdown className={cls.form_item} optionList={getPrefNames()} name="region" onChange={onChangePrefecture} />
                )}
                <Wrapper apiKey={api.googleMapsApiKey}>
                    <MapRegion className={cls.form_item} geometry={geometry} />
                </Wrapper>
                <fieldset hidden={!expOpened} className={spbw('fieldset', cls.form_item)}>
                    <legend className="fieldset-legend">Experiments</legend>
                    Empty :(
                </fieldset>
                <fieldset hidden={!prefOpened} className={spbw('fieldset', cls.form_item)}>
                    <legend className="fieldset-legend">詳細設定</legend>
                    <label className="fieldset-item large">
                        <Dropdown className="fieldset-item" optionList={regionNames} name="town" onChange={onChangeTown} />
                    </label>
                    <label className="fieldset-item">
                        <Checkbox name="compass" className="checkbox checkbox-mr"/>
                        コンパスを表示
                    </label>
                    <label className="fieldset-item">
                        <Checkbox name="timer" defaultChecked={true} className="checkbox checkbox-mr"/>
                        タイマーを表示
                    </label>
                </fieldset>
                <div className={cls.form_item}>
                    <Button
                        className="block"
                        onPointerDown={prefBtnDown}
                        onClick={prefBtnClick}
                        onContextMenu={() => false}
                    >
                        詳細設定
                    </Button>
                </div>
                <div className={cls.form_item}>
                    <Button type="submit" className="special block">Start</Button>
                </div>
            </form>
        </div>
    );
}

EnterGame.propTypes = {
    className: PropTypes.string
};
EnterGame.defaultProps = {
    className: ''
}

export default EnterGame;
