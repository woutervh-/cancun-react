import MapLayer from './MapLayer';
import MapTilesLayer from './MapTilesLayer';
import MapViewController from './MapViewController';
import React from 'react';
import {Canvas, Composition, Group, Picture, Rectangle, Scale, Translate} from './canvas';
import VectorUtil from '../VectorUtil';
import objectAssign from 'object-assign';
import ImageFrontier from './ImageFrontier';
import {WebMercator} from './Projections';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.draw = this.draw.bind(this);
        this.shouldTransformToCanvas = this.shouldTransformToCanvas.bind(this);
        this.shouldTransformToHtml = this.shouldTransformToHtml.bind(this);
        this.transformCanvasLayer = this.transformCanvasLayer.bind(this);
        this.transformMapTilesLayer = this.transformMapTilesLayer.bind(this);
        this.transformHtmlLayer = this.transformHtmlLayer.bind(this);
    }

    static propTypes = {
        view: React.PropTypes.shape({
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired,
            zoom: React.PropTypes.number.isRequired
        }).isRequired,
        onViewChange: React.PropTypes.func.isRequired,
        onLongViewChange: React.PropTypes.func.isRequired,
        onLocationSelect: React.PropTypes.func.isRequired,
        onTap: React.PropTypes.func.isRequired,
        projection: React.PropTypes.oneOf([WebMercator]).isRequired,
        imageFrontier: React.PropTypes.instanceOf(ImageFrontier).isRequired
    };

    static defaultProps = {
        projection: WebMercator,
        imageFrontier: new ImageFrontier()
    };

    state = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.view != nextProps.view
            || this.props.onViewChange != nextProps.onViewChange
            || this.props.onLongViewChange != nextProps.onLongViewChange
            || this.props.onLocationSelect != nextProps.onLocationSelect
            || this.props.onTap != nextProps.onTap
            || this.props.projection != nextProps.projection
            || this.props.imageFrontier != nextProps.imageFrontier
            || this.props.children != nextProps.children
            || this.state.width != nextState.width
            || this.state.height != nextState.height;
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    draw() {
        this.props.imageFrontier.clear();
        let layers = React.Children.toArray(this.props.children);
        this.refs.canvas.draw({
            type: Group,
            props: {
                children: [
                    ...layers.filter(this.shouldTransformToCanvas).map(this.transformCanvasLayer),
                    {
                        type: Rectangle,
                        props: {
                            width: this.state.width,
                            height: this.state.height,
                            strokeStyle: 'rgba(255, 0, 0, 1)',
                            fillStyle: 'rgba(0, 0, 0, 0)'
                        }
                    }
                ]
            }
        });
    }

    shouldTransformToCanvas(layer) {
        return layer.type == MapTilesLayer || layer.type == MapLayer && layer.props.render == 'canvas';
    }

    shouldTransformToHtml(layer) {
        return layer.type == MapLayer && layer.props.render == 'html';
    }

    transformCanvasLayer(layer) {
        if (layer.type == MapTilesLayer) {
            return this.transformMapTilesLayer(layer);
        } else {
            const {width, height} = this.state;
            const zoomLevel = Math.round(this.props.view.zoom);
            const scale = Math.pow(2, this.props.view.zoom - zoomLevel);
            const {x, y} = VectorUtil.multiply(this.props.view, Math.pow(2, zoomLevel - Math.floor(this.props.view.zoom)));

            let center = this.props.projection.project(layer.props, zoomLevel);
            let offset = VectorUtil.add(VectorUtil.multiply(VectorUtil.subtract(center, {x, y}), scale), {
                x: width / 2,
                y: height / 2
            });
            return {
                type: Translate,
                props: {
                    ...offset,
                    children: layer.props.children
                }
            };
        }
    }

    transformMapTilesLayer(layer) {
        const tileProvider = layer.props.tileProvider;
        const imageFrontier = this.props.imageFrontier;
        const {width, height} = this.state;
        const zoomLevel = Math.round(this.props.view.zoom);
        const scale = Math.pow(2, this.props.view.zoom - zoomLevel);
        const {x, y} = VectorUtil.multiply(this.props.view, Math.pow(2, zoomLevel - Math.floor(this.props.view.zoom)));

        let firstLoadedAncestor = (i, j, zoomLevel) => {
            let isLoaded = (i, j, zoomLevel) => {
                let source = tileProvider.getTileUrl(i, j, zoomLevel, layer.props.style);
                return imageFrontier.isLoaded(source);
            };
            while (zoomLevel >= tileProvider.minZoomLevel && !isLoaded(i, j, zoomLevel) && layer.props.displayCachedTiles) {
                i = Math.floor(i / 2);
                j = Math.floor(j / 2);
                zoomLevel -= 1;
            }
            if (isLoaded(i, j, zoomLevel)) {
                return [i, j, zoomLevel];
            } else {
                return [null, null, null];
            }
        };

        let byDistanceFromCenter = ([,,, aTop, aLeft], [,,, bTop, bLeft]) => {
            let adx = aLeft + tileProvider.tileWidth / 2 - width / 2;
            let ady = aTop + tileProvider.tileHeight / 2 - height / 2;
            let bdx = bLeft + tileProvider.tileWidth / 2 - width / 2;
            let bdy = bTop + tileProvider.tileHeight / 2 - height / 2;
            let adr = adx * adx + ady * ady;
            let bdr = bdx * bdx + bdy * bdy;
            return adr - bdr;
        };

        let priority = 0;

        let topLeft = VectorUtil.round({
            x: x - width / 2 / scale,
            y: y - height / 2 / scale
        });
        let [loadedTiles, toLoadTiles] = MapView.generateTilesList([topLeft.x, topLeft.y], [width / scale, height / scale], zoomLevel, tileProvider, firstLoadedAncestor);
        toLoadTiles.sort(byDistanceFromCenter).forEach(([i, j, zoomLevel]) => {
            let source = tileProvider.getTileUrl(i, j, zoomLevel, layer.props.style);
            imageFrontier.fetch(source, priority--, this.draw);
        });

        let preTopLeft = VectorUtil.round({
            x: x - width / 2 / scale * (1 + layer.props.preloadHorizontal),
            y: y - height / 2 / scale * (1 + layer.props.preloadVertical)
        });
        let [, preFetchTiles] = MapView.generateTilesList(
            [preTopLeft.x, preTopLeft.y],
            [width / scale * (1 + layer.props.preloadHorizontal), height / scale * (1 + layer.props.preloadVertical)],
            zoomLevel,
            tileProvider,
            (i, j, zoomLevel) => [null, null, null]
        );
        preFetchTiles.sort(byDistanceFromCenter).forEach(([i, j, zoomLevel]) => {
            let source = tileProvider.getTileUrl(i, j, zoomLevel, layer.props.style);
            imageFrontier.fetch(source, priority--);
        });

        return {
            type: Scale,
            props: {
                scaleWidth: scale,
                scaleHeight: scale,
                children: Object.keys(loadedTiles)
                    .sort((keyA, keyB) => loadedTiles[keyA].zoomLevel - loadedTiles[keyB].zoomLevel)
                    .map(key => {
                        let {i, j, zoomLevel, top, left, width, height} = loadedTiles[key];
                        let source = layer.props.tileProvider.getTileUrl(i, j, zoomLevel, layer.props.style);
                        return {
                            type: Picture,
                            props: {
                                image: this.props.imageFrontier.getLoadedImage(source),
                                top,
                                left,
                                width,
                                height
                            }
                        }
                    })
            }
        };
    }

    transformHtmlLayer(layer, index) {
        const {width, height} = this.state;
        const zoomLevel = Math.round(this.props.view.zoom);
        const scale = Math.pow(2, this.props.view.zoom - zoomLevel);
        const {x, y} = VectorUtil.multiply(this.props.view, Math.pow(2, zoomLevel - Math.floor(this.props.view.zoom)));

        let center = this.props.projection.project(layer.props, zoomLevel);
        let offset = VectorUtil.add(VectorUtil.multiply(VectorUtil.subtract(center, {x, y}), scale), {
            x: width / 2,
            y: height / 2
        });
        return <div key={index} style={{position: 'absolute', top: offset.y, left: offset.x}}>
            {layer.props.children}
        </div>;
    }

    static generateTilesList([x, y], [width, height], zoomLevel, tileProvider, firstLoadedAncestor) {
        let startTile = {
            i: Math.floor(x / tileProvider.tileWidth),
            j: Math.floor(y / tileProvider.tileHeight)
        };
        let endTile = {
            i: Math.ceil((x + width) / tileProvider.tileWidth),
            j: Math.ceil((y + height) / tileProvider.tileHeight)
        };
        let loadedTiles = {};
        let toLoadTiles = [];
        for (let i = startTile.i; i < endTile.i; i++) {
            for (let j = startTile.j; j < endTile.j; j++) {
                let [ai, aj, aZoomLevel] = firstLoadedAncestor(i, j, zoomLevel);
                if (i != ai || j != aj || zoomLevel != aZoomLevel) {
                    let top = j * tileProvider.tileHeight - y;
                    let left = i * tileProvider.tileWidth - x;
                    toLoadTiles.push([i, j, zoomLevel, top, left]);
                }
                if (ai != null && aj != null && aZoomLevel != null) {
                    let scale = Math.pow(2, zoomLevel - aZoomLevel);
                    loadedTiles[[ai, aj, aZoomLevel]] = {
                        i: ai,
                        j: aj,
                        zoomLevel: aZoomLevel,
                        top: aj * tileProvider.tileHeight * scale - y,
                        left: ai * tileProvider.tileWidth * scale - x,
                        width: tileProvider.tileWidth * scale,
                        height: tileProvider.tileHeight * scale
                    };
                }
            }
        }
        return [loadedTiles, toLoadTiles]
    }

    render() {
        return <span>
            <MapViewController
                view={this.props.view}
                onViewChange={this.props.onViewChange}
                onLongViewChange={this.props.onLongViewChange}
                onLocationSelect={this.props.onLocationSelect}
                onTap={this.props.onTap}
                projection={this.props.projection}
            >
                <Canvas ref="canvas" width={this.state.width} height={this.state.height}/>
            </MapViewController>
            {React.Children.toArray(this.props.children).filter(this.shouldTransformToHtml).map(this.transformHtmlLayer)}
        </span>;
    }
};
