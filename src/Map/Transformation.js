export default class Transformation {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;

        this.transform = this.transform.bind(this);
        this.untransform = this.untransform.bind(this);
    }

    transform({x, y}, scale = 1) {
        return {
            x: scale * (this.a * x + this.b),
            y: scale * (this.c * y + this.d)
        };
    }

    untransform({x, y}, scale = 1) {
        return {
            x: (x / scale - this.b) / this.a,
            y: (y / scale - this.d) / this.c
        };
    }
};
