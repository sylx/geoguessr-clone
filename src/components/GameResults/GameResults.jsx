import PropTypes from 'prop-types';

import spbw from '../../utils/spbw';
import strCut from '../../utils/str-cut';
import geoUrl from '../../utils/geo-url';
import readableDistance from '../../utils/readable/readable-distance';
import readableTime from '../../utils/readable/readable-time';
import readablePercentage from '../../utils/readable/readable-percentage';

import calcGeoDistance from '../../utils/calc/calc-geo-distance';
import calcAccuracy from '../../utils/calc/calc-accuracy';
import calcPoints from '../../utils/calc/calc-points';

import gameConfig from '../../config/game.json';
import cls from './game-results.module.css';
import { useEffect,useState } from 'react';
import { useJapanRegion } from '../../utils/japan';

const formulas = `
You can scroll this message.
The formulas could be shortened but they are not - to better understand their sense.

[Formulas]

Guess accuracy (A):
 A = 1 - D / (E / 4); A ≥ 0;

Points (P):
 F = U * Floor(T / I) + 1;
 P = Floor(A / F * M);

[Units]

D - Distance [meters]
T - Time (spent to guess) [seconds]
A - Accuracy [%]
P - Points [1]
E - Earth Circumference [meters]
F - TPE [1]
I - TPE Time [seconds] = ${gameConfig.value.tpeTime}
U - TPE Multiplier [1] = ${gameConfig.value.tpeMul}
M - Max Points [1] = ${gameConfig.value.maxPoints}
Floor - Rounding Down

[Definitions]

"TPE" (Time-Points-Effect) affects the points: the greater the effect, the more points are deducted
"TPE Time" is the time passed to increase the effect. (The effect increases after every N seconds)
"TPE Multiplier" is the effect coefficient: the greater its value, the more points are deducted
`;

function GameResults({ className, map, data,getParams,info }) {
    const cutCoords = a => a.map(el => strCut(el.toString(), 7)).join(',');

    if(!info) return null

    const dst = calcGeoDistance(data.guessPos, data.realPos)
    const acc = calcAccuracy(dst,info.longest);

    return (
        <div className={spbw(className, cls.results)}>
            <div>
                <div className="container">
                    <h2 className="title title-center section-title">Results</h2>
                    <div className={cls.map}>{map}</div>
                    <div className={cls.main}>
                        <div className={cls.row}>
                            <p className={cls.col}>対象地域:: <span className={cls.val}>{info.name}</span></p>
                            <p className={cls.col}>域内最大距離: <span className={cls.val}>{readableDistance(info.longest)}</span></p>
                        </div>
                        <div className={cls.row}>
                            <p className={cls.col}>
                                予想位置:
                                <a
                                    href={geoUrl(data.guessPos)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {cutCoords(data.guessPos)}
                                </a>
                            </p>
                            <p className={cls.col}>
                                正解位置:
                                <a
                                    href={geoUrl(data.realPos)}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {cutCoords(data.realPos)}
                                </a>
                            </p>
                        </div>
                        <div className={cls.row}>
                            <p className={cls.col}>距離: <span className={cls.val}>{readableDistance(dst)}</span></p>
                            <p className={cls.col}>時間: <span className={cls.val}>{readableTime(data.time)}</span></p>
                        </div>
                        <div className={cls.row}>
                            <p className={cls.col}>位置の正確さ: <span className={cls.strong}>{readablePercentage(acc)}</span></p>
                            <p className={cls.col}>スコア: <span className={cls.strong}>{calcPoints(acc, data.time)}</span></p>
                        </div>
                        <div className={cls.row}>
                            <p className={cls.col}><a href="#" className={cls.button} onClick={(e) => { e.preventDefault();window.location.reload();}}>同じ設定でもう一度</a></p>
                            <p className={cls.col}><a href="#" className={cls.button} onClick={(e) => { e.preventDefault();window.location.href="/"; }}>最初の画面に戻る</a></p>                            
                        </div>

                        <div className={cls.row}>
                            <p className={cls.col}>
                                {/* eslint-disable-next-line */}
                                <a className={cls.show_formulas} href="#" onClick={(e) => {
                                    alert(formulas);
                                    e.preventDefault();
                                }}>Show accuracy & points formulas</a>
                            </p>
                        </div>
                    </div>
                    <p className={cls.home_link}>
                        <a href="/">Home</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

GameResults.propTypes = {
    className: PropTypes.string,
    map: PropTypes.object,
    data: PropTypes.object
};
GameResults.defaultProps = {
    className: '',
    map: <span />,
    data: {}
};

export default GameResults;
