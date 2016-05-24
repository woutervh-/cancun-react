export default class Base {
    coordinateToPoint(coordinate, zoomLevel) {
        return this.transform(this.project(coordinate), this.scale(zoomLevel));
    }

    pointToCoordinate(point, zoomLevel) {
        return this.unproject(this.untransform(point, this.scale(zoomLevel)));
    }

    scale(zoomLevel) {
        return this.tileSize() * Math.pow(2, zoomLevel);
    }

    zoomLevel(scale) {
        return Math.log2(scale / this.tileSize());
    }

    tileSize() {
        return 256;
    }
};
