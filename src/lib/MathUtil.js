export default class MathUtil {
    static ZERO = 0;

    static ONE = 1;

    static lerp(a, b, t) {
        return a + t * (b - a);
    }

    static norm(a, b, t) {
        return (t - a) / (b - a);
    }
};
