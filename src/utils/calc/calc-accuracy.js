import naturalConfig from '../../config/natural.json';

const calcAccuracy = (d,longest) => Math.max(1 - d / (longest / 2), 0);

export default calcAccuracy;
