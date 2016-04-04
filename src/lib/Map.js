let apiKey = '8havdz9a6s5theax5zk334ge';

let baseUrls = [
    'https://a.api.tomtom.com/lbs/map/3/basic',
    'https://b.api.tomtom.com/lbs/map/3/basic',
    'https://c.api.tomtom.com/lbs/map/3/basic',
    'https://d.api.tomtom.com/lbs/map/3/basic'
];

let minZoom = 0;
let maxZoom = 18;

let urlCache = {};

export default class Map {
    constructor() {
        this.urlIndex = 0;
    }

    getTileUrl(zoom, x, y) {
        zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
        let tiles = Math.pow(2, zoom);
        x = (x % tiles + tiles) % tiles;
        y = (y % tiles + tiles) % tiles;

        if (!([zoom, x, y] in urlCache)) {
            urlCache[[zoom, x, y]] = baseUrls[this.urlIndex++ % baseUrls.length] + '/1/' + zoom + '/' + x + '/' + y + '.png?key=' + apiKey;
        }

        return urlCache[[zoom, x, y]];
    }

    get minZoom() {
        return minZoom;
    }

    get maxZoom() {
        return maxZoom;
    }

    get tileWidth() {
        return 256;
    }

    get tileHeight() {
        return 256;
    }
}
