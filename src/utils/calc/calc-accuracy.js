import naturalConfig from '../../config/natural.json';

// y=\frac{\left(\left(1-\frac{x}{L}\right)^{a}+\left(1-\frac{x}{L}\right)\right)}{2}
// a=70は適当な値
const calcAccuracy = (x,L) => (Math.pow(1-x/L,70)+(1-x/L))/2;

export default calcAccuracy;
