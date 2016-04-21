export default class MathUtil {
    static lerp(a, b, t) {
        return a + t * (b - a);
    }

    static norm(a, b, t) {
        return (t - a) / (b - a);
    }

    static distance(p1, p2) {
        return Math.sqrt(this.distance2(p1, p2));
    }

    static distance2(p1, p2) {
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        return dx * dx + dy + dy;
    }

    static add(p1, p2) {
        return {x: p1.x + p2.x, y: p1.y + p2.y};
    }

    static subtract(p1, p2) {
        return {x: p1.x - p2.x, y: p1.y - p2.y};
    }

    static multiply(p, s) {
        return {x: p.x * s, y: p.y * s};
    }

    static divide(p, s) {
        return {x: p.x / s, y: p.y / s};
    }
};
