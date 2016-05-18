//const apiKey = '8havdz9a6s5theax5zk334ge';
const apiKey = 'wqz3ad2zvhnfsnwpddk6wgqq';
const baseUrls = [
    'https://a.api.tomtom.com/lbs/map/3/flow',
    'https://b.api.tomtom.com/lbs/map/3/flow',
    'https://c.api.tomtom.com/lbs/map/3/flow',
    'https://d.api.tomtom.com/lbs/map/3/flow'
];
const styles = [
    {
        label: 'Absolute flow',
        value: 'absolute'
    }, {
        label: 'Relative flow',
        value: 'relative'
    }
];
const minZoomLevel = 0;
const maxZoomLevel = 18;
const tileSize = 256;

let urlIndex = 0;
let urlCache = {};

export default class FlowHelper {
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

