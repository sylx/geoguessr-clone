import PropTypes from 'prop-types';

import spbw from '../../../utils/spbw';
import quitImg from '../../../assets/img/quit.png';
import flagImg from '../../../assets/img/flag.png';
import zoomInImg from '../../../assets/img/zoomIn.png';
import zoomOutImg from '../../../assets/img/zoomOut.png';
import ejectImg from '../../../assets/img/door-open-solid.png';

import cls from './buttons.module.css';

function Buttons({ events }) {
    return (
        <div className="widget-group">
            <button className={spbw('btn-game', cls.btn)} onClick={events?.quit} title="やめる">
                <img src={quitImg} alt="X" className="img-inv" />
            </button>
            <button className={spbw('btn-game', cls.btn)} onClick={events?.goToStart} title="スタート地点に戻る">
                <img src={flagImg} alt="Flag" className="img-inv" />
            </button>
            <button className={spbw('btn-game', cls.btn)} onClick={events?.zoomIn} title="ズームイン">
                <img src={zoomInImg} alt="+" className="img-inv" />
            </button>
            <button className={spbw('btn-game', cls.btn)} onClick={events?.zoomOut} title="ズームアウト">
                <img src={zoomOutImg} alt="-" className="img-inv" />
            </button>
            <button className={spbw('btn-game', cls.btn)} onClick={events?.eject} title="外に出る（店の中から出れない時に）">
                <img src={ejectImg} alt="Eject" className="img-inv" />
            </button>
        </div>
    );
}
Buttons.propTypes = {
    events: PropTypes.object
};
Buttons.defaultProps = {
    events: {}
};

export default Buttons;
