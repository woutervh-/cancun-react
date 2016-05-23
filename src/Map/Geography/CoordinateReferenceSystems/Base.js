export default class Base {
    coordinateToPoint(coordinate, zoomLevel) {
        return this.transform(this.project(coordinate), this.scale(zoomLevel));
    }

    pointToCoordinate(point, zoomLevel) {
        return this.unproject(this.untransform(point, this.scale(zoomLevel)));
    }

    scale(zoomLevel) {
        return 256 * Math.pow(2, zoomLevel);
    }

    zoomLevel(scale) {
        return Math.log2(scale / 256);
    }
};
