export default class VectorUtil {
    static ZERO = {x: 0, y: 0};

    static ONE = {x: 1, y: 1};

    static lerp(p1, p2, t) {
        return {x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y)};
    }

    static norm(p1, p2, t) {
        return {x: (t - p1.x) / (p2.x - p1.x), y: (t - p1.y) / (p2.y - p1.y)};
    }

    static distance(p1, p2) {
        return Math.sqrt(this.distance2(p1, p2));
    }

    static distance2(p1, p2) {
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        return dx * dx + dy * dy;
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

    static floor(p) {
        return {x: Math.floor(p.x), y: Math.floor(p.y)};
    }

    static round(p) {
        return {x: Math.round(p.x), y: Math.round(p.y)};
    }

    static ceil(p) {
        return {x: Math.ceil(p.x), y: Math.ceil(p.y)};
    }
};
