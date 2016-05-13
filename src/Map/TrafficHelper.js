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

let urlIndex = 0;
let urlCache = {};

export default class TrafficHelper {
    static getTileUrl(x, y, zoomLevel, style = styles[0].value) {
        zoomLevel = Math.max(minZoomLevel, Math.min(maxZoomLevel, zoomLevel));
        let countTiles = Math.pow(2, zoomLevel);
        x = (x % countTiles + countTiles) % countTiles;
        y = (y % countTiles + countTiles) % countTiles;

        if (!([zoomLevel, x, y, style] in urlCache)) {
            urlCache[[zoomLevel, x, y, style]] = baseUrls[urlIndex++ % baseUrls.length] + '/' + style + '/' + zoomLevel + '/' + x + '/' + y + '.png?key=' + apiKey;
        }

        return urlCache[[zoomLevel, x, y, style]];
    }

    static get styles() {
        return styles;
    }
};
