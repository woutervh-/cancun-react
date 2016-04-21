//const apiKey = '8havdz9a6s5theax5zk334ge';
const apiKey = 'wqz3ad2zvhnfsnwpddk6wgqq';
const baseUrls = [
    'https://a.api.tomtom.com/lbs/map/3/basic',
    'https://b.api.tomtom.com/lbs/map/3/basic',
    'https://c.api.tomtom.com/lbs/map/3/basic',
    'https://d.api.tomtom.com/lbs/map/3/basic'
];
const minZoom = 0;
const maxZoom = 18;
const tileSize = 256;
const maxLatitude = 85.051128779806;

let urlIndex = 0;
let urlCache = {};

export default class MapHelper {
    static getTileUrl(x, y, zoom) {
        zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
        let countTiles = Math.pow(2, zoom);
        x = (x % countTiles + countTiles) % countTiles;
        y = (y % countTiles + countTiles) % countTiles;

        if (!([zoom, x, y] in urlCache)) {
            urlCache[[zoom, x, y]] = baseUrls[urlIndex++ % baseUrls.length] + '/1/' + zoom + '/' + x + '/' + y + '.png?key=' + apiKey + '&tileSize=' + tileSize;
        }

        return urlCache[[zoom, x, y]];
    }

    static project({latitude = 0, longitude = 0}, zoom = 0) {
        let scale = Math.pow(2, Math.max(minZoom, Math.min(maxZoom, zoom))) * tileSize;
        latitude = Math.min(maxLatitude, Math.max(-maxLatitude, latitude));
        longitude = Math.min(180, Math.max(-180, longitude));
        let x = Math.floor((longitude / 360 + 0.5) * scale);
        let y = -Math.floor(scale / 2 / (Math.PI * Math.log(Math.tan(Math.PI / 4 + latitude * Math.PI / 360)) + 1));
        return {x, y};
    }

    static unproject({x = 0, y = 0} = {}, zoom = 0) {
        let scale = Math.pow(2, Math.max(minZoom, Math.min(maxZoom, zoom))) * tileSize;
        x = (x % scale + scale) % scale;
        y = (y % scale + scale) % scale;
        let latitude = -360 / Math.PI * (Math.atan(Math.exp((y / scale * 2 - 1) * Math.PI)) - Math.PI / 4);
        let longitude = (x / scale - 0.5) * 360;
        return {latitude, longitude}
    }

    static get minZoom() {
        return minZoom;
    }

    static get maxZoom() {
        return maxZoom;
    }

    static get tileWidth() {
        return tileSize;
    }

    static get tileHeight() {
        return tileSize;
    }
};
