//const apiKey = '8havdz9a6s5theax5zk334ge';
const apiKey = 'wqz3ad2zvhnfsnwpddk6wgqq';
const baseUrls = [
    //'http://a.wouter-lbs:8000/lbs/map/3/basic',
    //'http://b.wouter-lbs:8000/lbs/map/3/basic',
    //'http://c.wouter-lbs:8000/lbs/map/3/basic',
    //'http://d.wouter-lbs:8000/lbs/map/3/basic',
    //'http://e.wouter-lbs:8000/lbs/map/3/basic',
    //'http://f.wouter-lbs:8000/lbs/map/3/basic',
    //'http://g.wouter-lbs:8000/lbs/map/3/basic',
    //'http://h.wouter-lbs:8000/lbs/map/3/basic',
    //'http://i.wouter-lbs:8000/lbs/map/3/basic',
    //'http://j.wouter-lbs:8000/lbs/map/3/basic',
    //'http://k.wouter-lbs:8000/lbs/map/3/basic',
    //'http://l.wouter-lbs:8000/lbs/map/3/basic'
    'https://a.api.tomtom.com/lbs/map/3/basic',
    'https://b.api.tomtom.com/lbs/map/3/basic',
    'https://c.api.tomtom.com/lbs/map/3/basic',
    'https://d.api.tomtom.com/lbs/map/3/basic'
];
const styles = [
    {
        label: 'Day',
        value: '1'
    }, {
        label: 'Night',
        value: 'night'
    }
];
const minZoomLevel = 0;
const maxZoomLevel = 18;
const tileSize = 256;

let urlIndex = 0;
let urlCache = {};

export default class MapHelper {
    static getTileUrl(i, j, zoomLevel, style = styles[0].value) {
        zoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, zoomLevel));
        let countTiles = Math.pow(2, zoomLevel);
        i = (i % countTiles + countTiles) % countTiles;
        j = (j % countTiles + countTiles) % countTiles;

        if (!([zoomLevel, i, j, style] in urlCache)) {
            urlCache[[zoomLevel, i, j, style]] = baseUrls[urlIndex++ % baseUrls.length] + '/' + style + '/' + zoomLevel + '/' + i + '/' + j + '.png?key=' + apiKey + '&tileSize=' + tileSize;
        }

        return urlCache[[zoomLevel, i, j, style]];
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
