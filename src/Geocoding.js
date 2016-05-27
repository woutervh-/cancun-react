import jsonp from 'jsonp';

const apiKey = '8havdz9a6s5theax5zk334ge';
const baseUrl = 'https://api.tomtom.com/lbs/services/geocode/4/geocode';

export default class Geocoding {
    static forwardGeocode(query, callback) {
        let url = baseUrl + '?key=' + apiKey + '&format=jsonp&query=' + encodeURIComponent(query);
        jsonp(url, (error, data) => {
            if (!!error) {
                callback(error, []);
            } else {
                callback(error, data['geoResponse']['geoResult']);
            }
        });
    }
};
