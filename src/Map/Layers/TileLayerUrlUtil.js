export default class TileLayerUrlUtil {
    constructor() {
        this.urlCache = {};
        this.urlCounter = {};

        this.getTileUrl = this.getTileUrl.bind(this);
    }

    getTileUrl(layer, i, j, zoomLevel) {
        let urlTemplate = layer.props.url;

        if (!([i, j, zoomLevel, urlTemplate] in this.urlCache)) {
            if (!(urlTemplate in this.urlCounter)) {
                this.urlCounter[urlTemplate] = 0;
            }

            let subdomains = layer.props.subdomains;
            let subdomain = subdomains[this.urlCounter[urlTemplate]++ % subdomains.length];
            let url = urlTemplate;
            url = url.replace(/\{s}/g, subdomain);
            url = url.replace(/\{x}/g, i);
            url = url.replace(/\{y}/g, j);
            url = url.replace(/\{z}/g, zoomLevel);
            this.urlCache[[i, j, zoomLevel, urlTemplate]] = url;
        }

        return this.urlCache[[i, j, zoomLevel, urlTemplate]];
    }
};
