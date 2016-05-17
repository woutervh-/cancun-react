const tileSize = 256;
const maxLatitude = (360 * Math.atan(Math.exp(Math.PI)) / Math.PI - 90);
const radius = 6378137;

export default class WebMercator {
    static project({latitude = 0, longitude = 0}, zoomLevel = 0) {
        let scale = Math.pow(2, zoomLevel) * tileSize;
        latitude = Math.min(maxLatitude, Math.max(-maxLatitude, latitude));
        longitude = Math.min(180, Math.max(-180, longitude));
        let x = scale / 2 * (longitude / 180 + 1);
        let y = scale / 2 * (1 - Math.log(Math.tan((latitude + 90) * Math.PI / 360)) / Math.PI);
        return {x, y};
    }

    static unproject({x = 0, y = 0} = {}, zoomLevel = 0) {
        let scale = Math.pow(2, zoomLevel) * tileSize;
        x = (x % scale + scale) % scale;
        y = (y % scale + scale) % scale;
        let latitude = -360 / Math.PI * Math.atan(Math.exp((y / scale * 2 - 1) * Math.PI)) + 90;
        let longitude = (x / scale - 0.5) * 360;
        return {latitude, longitude}
    }

    static projectEarth({latitude=0, longitude=0}) {
        latitude = Math.min(maxLatitude, Math.max(-maxLatitude, latitude));
        longitude = Math.min(180, Math.max(-180, longitude));
        let x = radius * longitude * Math.PI / 180;
        let sin = Math.sin(latitude * Math.PI / 180);
        let y = radius * Math.log((1 + sin) / (1 - sin)) / 2;
        return {x, y};
    }

    static unprojectEarth({x=0, y=0}) {
        let latitude = (2 * Math.atan(Math.exp(y / radius)) - (Math.PI / 2)) * 180 / Math.PI;
        let longitude = x * 180 / Math.PI / radius;
        return {latitude, longitude};
    }
};
