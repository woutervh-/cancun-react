export default class MathUtil {
    static lerp(a, b, t) {
        return a + t * (b - a);
    }

    static norm(a, b, t) {
        return (t - a) / (b - a);
    }

    static deg2rad(deg) {
        return deg / 180 * Math.PI;
    }

    static rad2deg(rad) {
        return rad * 180 / Math.PI;
    }
};
