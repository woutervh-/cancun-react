import Leaflet from 'leaflet';

export default class Injector {
    static inject(...plugins) {
        plugins.forEach(plugin => plugin(Leaflet));
    }
};