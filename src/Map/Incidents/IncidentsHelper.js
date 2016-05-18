import jsonp from 'jsonp';
import {WebMercator} from '../Projections';
import VectorUtil from '../../VectorUtil';
import PlaceHolder from '../../../public/images/place-holder';

//const apiKey = '8havdz9a6s5theax5zk334ge';
const apiKey = 'wqz3ad2zvhnfsnwpddk6wgqq';
const baseUrl = 'https://api.tomtom.com/lbs/services';
const width = 4092;
const height = 4092;

export default class IncidentsHelper {
    static viewportDescription({x = 0, y = 0}, zoomLevel, callback) {
        let halfViewport = {x: width / 2, y: height / 2};
        let northWest = WebMercator.unproject(VectorUtil.subtract({x, y}, halfViewport), zoomLevel);
        let southEast = WebMercator.unproject(VectorUtil.add({x, y}, halfViewport), zoomLevel);
        let earthNorthWest = WebMercator.projectEarth(northWest);
        let earthSouthEast = WebMercator.projectEarth(southEast);
        let boundingBox = earthNorthWest.x + ',' + earthSouthEast.y + ',' + earthSouthEast.x + ',' + earthNorthWest.y;
        let url = baseUrl + '/viewportDesc/3/' + boundingBox + '/' + zoomLevel + '/' + boundingBox + '/' + zoomLevel + '/false/jsonp?key=' + apiKey;
        jsonp(url, {param: 'jsonp'}, (error, data) => {
            if (!!error) {
                callback(error);
            } else {
                callback(null, data);
            }
        });
    }

    static trafficIcons({x = 0, y = 0}, zoomLevel, trafficModelId, callback) {
        let halfViewport = {x: width / 2, y: height / 2};
        let northWest = WebMercator.unproject(VectorUtil.subtract({x, y}, halfViewport), zoomLevel);
        let southEast = WebMercator.unproject(VectorUtil.add({x, y}, halfViewport), zoomLevel);
        let boundingBox = southEast.latitude + ',' + northWest.longitude + ',' + northWest.latitude + ',' + southEast.longitude;
        let url = baseUrl + '/trafficIcons/3/s1/' + boundingBox + '/' + zoomLevel + '/' + trafficModelId + '/jsonp?key=' + apiKey + '&projection=EPSG4326';
        jsonp(url, {param: 'jsonp'}, (error, data) => {
            if (!!error) {
                callback(error);
            } else {
                callback(null, data);
            }
        });
    }

    static lookupIconType(poi) {
        let marker = '';
        switch (poi['ic']) {
            case 0:
                marker += 'unknown';
                break;
            case 1:
                marker += 'accident';
                break;
            case 2:
                marker += 'fog';
                break;
            case 3:
                marker += 'dangerous';
                break;
            case 4:
                marker += 'rain';
                break;
            case 5:
                marker += 'ice';
                break;
            case 6:
                marker += 'jam';
                break;
            case 7:
                marker += 'lane';
                break;
            case 8:
                marker += 'road';
                break;
            case 9:
                marker += 'road';
                break;
            case 10:
                marker += 'wind';
                break;
            case 11:
                marker += 'flooding';
                break;
            case 12:
                marker += 'detour';
                break;
            case 13:
                marker += 'cluster';
                break;
            default:
                throw new Error('Unknown icon from incident data: ' + poi['ic']);
        }

        marker += '-';

        switch (poi['ty']) {
            case 0:
                marker += 'unknown';
                break;
            case 1:
                marker += 'minor';
                break;
            case 2:
                marker += 'moderate';
                break;
            case 3:
                marker += 'major';
                break;
            case 4:
                marker += 'undefined,';
                break;
            default:
                throw new Error('Unknown severity from incident data: ' + poi['ty']);
        }

        return PlaceHolder;
    }
};
