const apiKey = '8havdz9a6s5theax5zk334ge';
const baseUrls = [
    'https://a.api.tomtom.com/lbs/map/3/basic',
    'https://b.api.tomtom.com/lbs/map/3/basic',
    'https://c.api.tomtom.com/lbs/map/3/basic',
    'https://d.api.tomtom.com/lbs/map/3/basic'
];
const minZoom = 0;
const maxZoom = 18;
const tileSize = 256;

let urlIndex = 0;
let urlCache = {};

export default class MapHelper {
    getTileUrl(zoom, x, y) {
        let checked = {};
        checked.zoom = Math.max(minZoom, Math.min(maxZoom, zoom));
        let countTiles = Math.pow(2, checked.zoom);
        checked.x = (x % countTiles + countTiles) % countTiles;
        checked.y = (y % countTiles + countTiles) % countTiles;

        if (!([checked.zoom, checked.x, checked.y] in urlCache)) {
            urlCache[[checked.zoom, checked.x, checked.y]] = baseUrls[urlIndex++ % baseUrls.length] + '/1/' + checked.zoom + '/' + checked.x + '/' + checked.y + '.png?key=' + apiKey + '&tileSize=' + tileSize;
        }

        return urlCache[[checked.zoom, checked.x, checked.y]];
    }

    get minZoom() {
        return minZoom;
    }

    get maxZoom() {
        return maxZoom;
    }

    get tileWidth() {
        return tileSize;
    }

    get tileHeight() {
        return tileSize;
    }
};
