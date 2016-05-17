import jsonp from 'jsonp';
import {WebMercator} from '../Projections';
import VectorUtil from '../../VectorUtil';

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
        switch (poi['ic']) {
            case 0:
                return 'Unknown';
            case 1:
                return 'Accident';
            case 2:
                return 'Fog';
            case 3:
                return 'Dangerous';
            case 4:
                return 'Rain';
            case 5:
                return 'Ice';
            case 6:
                return 'Jam';
            case 7:
                return 'Lane';
            case 8:
                return 'Road';
            case 9:
                return 'Road';
            case 10:
                return 'Wind';
            case 11:
                return 'Flooding';
            case 12:
                return 'Detour';
            case 13:
                return 'Cluster';
        }

        // TODO: inspect severity for icon
    }
};
