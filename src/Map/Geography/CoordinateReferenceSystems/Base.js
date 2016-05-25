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

    wrapCoordinate({latitude, longitude}) {
        latitude += 90;
        latitude %= 180;
        latitude += 180;
        latitude %= 180;
        latitude -= 90;
        longitude += 180;
        longitude %= 360;
        longitude += 360;
        longitude %= 360;
        longitude -= 180;
        return {latitude, longitude};
    }

    wrapPoint({x, y}, zoomLevel) {
        let scale = this.scale(zoomLevel);
        let {min, max} = this.bounds();
        let minPoint = this.transform(min, scale);
        let maxPoint = this.transform(max, scale);
        let width = maxPoint.x - minPoint.x;
        let height = maxPoint.y - minPoint.y;
        x -= minPoint.x;
        x %= width;
        x += width;
        x %= width;
        x += minPoint.x;
        y -= minPoint.y;
        y %= height;
        y += height;
        y %= height;
        y += minPoint.y;
        return {x, y};
    }

    tileSize() {
        return 256;
    }
};
