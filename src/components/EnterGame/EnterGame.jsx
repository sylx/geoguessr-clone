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
    const {isLoaded,getPrefNames,getPrefGeometry,loadPref} = useJapanRegion();

    useEffect(() => {
        loadPref();
    },[loadPref]);

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

    const onChangeRegion = evt => {
        const paths=getPrefGeometry(evt.target.value);
        if(paths){
            setGeometry(paths);
            console.log("Region changed to",evt.target.value)
        }else{
            throw new Error("Region not found");
        }
    }

    return (
        <div className={spbw(cls.enter_game, className)}>            
            <form action="/game" method="get">
                { isLoaded && (
                <Dropdown className={cls.form_item} optionList={getPrefNames()} name="region" onChange={onChangeRegion} />
                )}
                <Wrapper apiKey={api.googleMapsApiKey}>
                    <MapRegion className={cls.form_item} geometry={geometry} />
                </Wrapper>
                <fieldset hidden={!expOpened} className={spbw('fieldset', cls.form_item)}>
                    <legend className="fieldset-legend">Experiments</legend>
                    Empty :(
                </fieldset>
                <fieldset hidden={!prefOpened} className={spbw('fieldset', cls.form_item)}>
                    <legend className="fieldset-legend">Preferences</legend>
                    <label className="fieldset-item">
                        <Checkbox name="compass" className="checkbox checkbox-mr"/>
                        Compass
                    </label>
                    <label className="fieldset-item">
                        <Checkbox name="timer" defaultChecked={true} className="checkbox checkbox-mr"/>
                        Timer
                    </label>
                </fieldset>
                <div className={cls.form_item}>
                    <Button
                        className="block"
                        onPointerDown={prefBtnDown}
                        onClick={prefBtnClick}
                        onContextMenu={() => false}
                    >
                        Preferences...
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
