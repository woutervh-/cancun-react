//const apiKey = '8havdz9a6s5theax5zk334ge';
const apiKey = 'wqz3ad2zvhnfsnwpddk6wgqq';
const baseUrls = [
    'https://a.api.tomtom.com/lbs/map/3/traffic',
    'https://b.api.tomtom.com/lbs/map/3/traffic',
    'https://c.api.tomtom.com/lbs/map/3/traffic',
    'https://d.api.tomtom.com/lbs/map/3/traffic'
];
const styles = [
    {
        label: 'S3',
        value: 's3'
    }
];
const minZoomLevel = 0;
const maxZoomLevel = 18;
const tileSize = 256;
const maxLatitude = (360 * Math.atan(Math.exp(Math.PI)) / Math.PI - 90);

let urlIndex = 0;
let urlCache = {};

export default class TrafficHelper {
    static getTileUrl(i, j, zoomLevel, style = styles[0].value) {
        zoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, zoomLevel));
        let countTiles = Math.pow(2, zoomLevel);
        i = (i % countTiles + countTiles) % countTiles;
        j = (j % countTiles + countTiles) % countTiles;

        if (!([zoomLevel, i, j, style] in urlCache)) {
            urlCache[[zoomLevel, i, j, style]] = baseUrls[urlIndex++ % baseUrls.length] + '/' + style + '/' + zoomLevel + '/' + i + '/' + j + '.png?key=' + apiKey;
        }

        return urlCache[[zoomLevel, i, j, style]];
    }

    static project({latitude = 0, longitude = 0}, zoom = 0) {
        let scale = Math.pow(2, Math.max(minZoomLevel, Math.min(maxZoomLevel, zoom))) * tileSize;
        latitude = Math.min(maxLatitude, Math.max(-maxLatitude, latitude));
        longitude = Math.min(180, Math.max(-180, longitude));
        let x = scale / 2 * (longitude / 180 + 1);
        let y = scale / 2 * (1 - Math.log(Math.tan((latitude + 90) * Math.PI / 360)) / Math.PI);
        return {x, y};
    }

    static unproject({x = 0, y = 0} = {}, zoom = 0) {
        let scale = Math.pow(2, Math.max(minZoomLevel, Math.min(maxZoomLevel, zoom))) * tileSize;
        x = (x % scale + scale) % scale;
        y = (y % scale + scale) % scale;
        let latitude = -360 / Math.PI * Math.atan(Math.exp((y / scale * 2 - 1) * Math.PI)) + 90;
        let longitude = (x / scale - 0.5) * 360;
        return {latitude, longitude}
    }

    static get minZoomLevel() {
        return minZoomLevel;
    }

    static get maxZoomLevel() {
        return maxZoomLevel;
    }

    static get tileWidth() {
        return tileSize;
    }

    static get tileHeight() {
        return tileSize;
    }

    static get styles() {
        return styles;
    }
};
