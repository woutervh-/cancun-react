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
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLongViewChange = this.handleLongViewChange.bind(this);
    }

    static propTypes = {
        view: React.PropTypes.shape({
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired,
            zoom: React.PropTypes.number.isRequired
        }).isRequired,
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
        viewOffset: {
            x: 0,
            y: 0,
            zoom: 0
        },
        width: window.innerWidth,
        height: window.innerHeight
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.view != nextProps.view
            || this.props.onLongViewChange != nextProps.onLongViewChange
            || this.props.onLocationSelect != nextProps.onLocationSelect
            || this.props.onTap != nextProps.onTap
            || this.props.projection != nextProps.projection
            || this.props.imageFrontier != nextProps.imageFrontier
            || this.props.children != nextProps.children
            || this.state.viewOffset != nextState.viewOffset
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

        const {width, height} = this.state;
        const zoomLevel = Math.round(this.props.view.zoom + this.state.viewOffset.zoom);
        const scale = Math.pow(2, this.props.view.zoom + this.state.viewOffset.zoom - zoomLevel);
        const {x, y} = VectorUtil.multiply(VectorUtil.add(this.props.view, this.state.viewOffset), Math.pow(2, zoomLevel - Math.floor(this.props.view.zoom + this.state.viewOffset.zoom)));
        const options = {width, height, zoomLevel, scale, x, y};

        let layers = React.Children.toArray(this.props.children);
        this.refs.canvas.draw({
            type: Group,
            props: {
                children: [
                    ...layers.filter(this.shouldTransformToCanvas).map(layer => this.transformCanvasLayer(layer, options)),
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

    transformCanvasLayer(layer, options) {
        if (layer.type == MapTilesLayer) {
            return this.transformMapTilesLayer(layer, options);
        } else {
            let center = this.props.projection.project(layer.props, options.zoomLevel);
            let offset = VectorUtil.add(VectorUtil.multiply(VectorUtil.subtract(center, options), options.scale), {
                x: options.width / 2,
                y: options.height / 2
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

    transformMapTilesLayer(layer, options) {
        const tileProvider = layer.props.tileProvider;
        const imageFrontier = this.props.imageFrontier;
        const style = layer.props.style;

        let firstLoadedAncestor = (i, j, zoomLevel) => {
            let isLoaded = (i, j, zoomLevel) => {
                let source = tileProvider.getTileUrl(i, j, zoomLevel, style);
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
            let adx = aLeft + tileProvider.tileWidth / 2 - options.width / 2;
            let ady = aTop + tileProvider.tileHeight / 2 - options.height / 2;
            let bdx = bLeft + tileProvider.tileWidth / 2 - options.width / 2;
            let bdy = bTop + tileProvider.tileHeight / 2 - options.height / 2;
            let adr = adx * adx + ady * ady;
            let bdr = bdx * bdx + bdy * bdy;
            return adr - bdr;
        };

        let priority = 0;

        let topLeft = VectorUtil.round({
            x: options.x - options.width / 2 / options.scale,
            y: options.y - options.height / 2 / options.scale
        });
        let [loadedTiles, toLoadTiles] = MapView.generateTilesList([topLeft.x, topLeft.y], [options.width / options.scale, options.height / options.scale], options.zoomLevel, tileProvider, firstLoadedAncestor);
        toLoadTiles.sort(byDistanceFromCenter).forEach(([i, j, zoomLevel]) => {
            let source = tileProvider.getTileUrl(i, j, zoomLevel, style);
            imageFrontier.fetch(source, priority--, this.draw);
        });

        let preTopLeft = VectorUtil.round({
            x: options.x - options.width / 2 / options.scale * (1 + layer.props.preloadHorizontal),
            y: options.y - options.height / 2 / options.scale * (1 + layer.props.preloadVertical)
        });
        let [, preFetchTiles] = MapView.generateTilesList(
            [preTopLeft.x, preTopLeft.y],
            [options.width / options.scale * (1 + layer.props.preloadHorizontal), options.height / options.scale * (1 + layer.props.preloadVertical)],
            options.zoomLevel,
            tileProvider,
            (i, j, zoomLevel) => [null, null, null]
        );
        preFetchTiles.sort(byDistanceFromCenter).forEach(([i, j, zoomLevel]) => {
            let source = tileProvider.getTileUrl(i, j, zoomLevel, style);
            imageFrontier.fetch(source, priority--);
        });

        return {
            type: Scale,
            props: {
                scaleWidth: options.scale,
                scaleHeight: options.scale,
                children: Object.keys(loadedTiles)
                    .sort((keyA, keyB) => loadedTiles[keyA].zoomLevel - loadedTiles[keyB].zoomLevel)
                    .map(key => {
                        let {i, j, zoomLevel, top, left, width, height} = loadedTiles[key];
                        let source = tileProvider.getTileUrl(i, j, zoomLevel, style);
                        return {
                            type: Picture,
                            props: {
                                image: imageFrontier.getLoadedImage(source),
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

    transformHtmlLayer(layer, index, options) {
        let center = this.props.projection.project(layer.props, options.zoomLevel);
        let offset = VectorUtil.add(VectorUtil.multiply(VectorUtil.subtract(center, options), options.scale), {
            x: options.width / 2,
            y: options.height / 2
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

    handleViewChange(view) {
        this.setState({
            viewOffset: {
                x: view.x - this.props.view.x,
                y: view.y - this.props.view.y,
                zoom: view.zoom - this.props.view.zoom
            }
        });
    }

    handleLongViewChange(view) {
        this.props.onLongViewChange(view);
        this.setState({viewOffset: {x: 0, y: 0, zoom: 0}});
    }

    render() {
        const {width, height} = this.state;
        const zoomLevel = Math.round(this.props.view.zoom);
        const scale = Math.pow(2, this.props.view.zoom - zoomLevel);
        const {x, y} = VectorUtil.multiply(this.props.view, Math.pow(2, zoomLevel - Math.floor(this.props.view.zoom)));
        const options = {width, height, zoomLevel, scale, x, y};
        const offset = {
            top: -this.state.viewOffset.y,
            left: -this.state.viewOffset.x
        };

        return <div style={{position: 'absolute'}}>
            <MapViewController
                view={{x: this.props.view.x + this.state.viewOffset.x, y: this.props.view.y + this.state.viewOffset.y, zoom: this.props.view.zoom + this.state.viewOffset.zoom}}
                onViewChange={this.handleViewChange}
                onLongViewChange={this.handleLongViewChange}
                onLocationSelect={this.props.onLocationSelect}
                onTap={this.props.onTap}
                projection={this.props.projection}
            >
                <Canvas ref="canvas" width={this.state.width} height={this.state.height}/>
            </MapViewController>
            <div style={{position: 'absolute', ...offset}}>
                {React.Children.toArray(this.props.children).filter(this.shouldTransformToHtml).map((layer, index) => this.transformHtmlLayer(layer, index, options))}
            </div>
        </div>;
    }
};
