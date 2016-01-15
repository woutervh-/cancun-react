let apiKey = '8havdz9a6s5theax5zk334ge';

let baseUrls = [
    'https://a.api.tomtom.com/lbs/map/3/basic',
    'https://b.api.tomtom.com/lbs/map/3/basic',
    'https://c.api.tomtom.com/lbs/map/3/basic',
    'https://d.api.tomtom.com/lbs/map/3/basic'
];

let minZoom = 0;
let maxZoom = 18;

export default class Map {
    constructor() {
        this.urlIndex = 0;
    }

    getTileUrl(zoom, x, y) {
        zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
        x = Math.max(0, x) % Math.pow(2, zoom);
        y = Math.max(0, y) % Math.pow(2, zoom);

        return baseUrls[this.urlIndex++ % baseUrls.length] + '/1/' + zoom + '/' + x + '/' + y + '.png?key=' + apiKey;
    }
}
