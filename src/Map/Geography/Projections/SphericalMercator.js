const maxLatitude = (360 * Math.atan(Math.exp(Math.PI)) / Math.PI - 90);
const earthRadius = 6378137;

export default class SphericalMercator {
    constructor() {
        this.project = this.project.bind(this);
        this.unproject = this.unproject.bind(this);
        this.bounds = this.bounds.bind(this);
    }

    project({latitude, longitude}) {
        let degreesToRadians = Math.PI / 180;
        let sin = Math.sin(Math.max(Math.min(maxLatitude, latitude), -maxLatitude) * degreesToRadians);
        return {
            x: earthRadius * longitude * degreesToRadians,
            y: earthRadius * Math.log((1 + sin) / (1 - sin)) / 2
        };
    }

    unproject({x, y}) {
        let radiansToDegrees = 180 / Math.PI;
        return {
            latitude: (2 * Math.atan(Math.exp(y / earthRadius)) - (Math.PI / 2)) * radiansToDegrees,
            longitude: x * radiansToDegrees / earthRadius
        };
    }

    bounds() {
        let size = earthRadius * Math.PI;
        return {
            min: {
                x: -size,
                y: -size
            },
            max: {
                x: size,
                y: size
            }
        };
    }

    static get radius() {
        return earthRadius;
    }
};
