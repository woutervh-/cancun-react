import MapHelper from './MapHelper';
import MapLayer from './MapLayer';
import MapTilesLayer from './MapTilesLayer';
import MapViewController from './MapViewController';
import React from 'react';
import {Canvas, Composition, Group, Picture, Rectangle, Scale, Translate} from './canvas';
import VectorUtil from '../VectorUtil';
import objectAssign from 'object-assign';
import ImageFrontier from './ImageFrontier';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.transformLayer = this.transformLayer.bind(this);
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
        imageFrontier: React.PropTypes.instanceOf(ImageFrontier).isRequired
    };

    static defaultProps = {
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
            || this.props.children != nextProps.children
            || this.state.width != nextState.width
            || this.state.height != nextState.height;
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        this.props.imageFrontier.setCallback(this.draw.bind(this))
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    static parent([i, j]) {
        return [Math.floor(i / 2), Math.floor(j / 2)];
    }

    static generateTilesHierarchy([x, y], [width, height], zoomLevel, tileProvider, isLoaded) {
        let tiles = [];
        let parents = [];
        let currentZoomLevel = zoomLevel;
        let current = MapView.generateTilesList([x, y], [width, height], Math.pow(2, zoomLevel - currentZoomLevel), tileProvider);
        while (current.length > 0 || parents.length > 0) {
            tiles[currentZoomLevel] = [];
            while (current.length > 0) {
                let tile = current.pop();
                let {i, j} = tile;
                if (isLoaded([i, j], currentZoomLevel)) {
                    tiles[currentZoomLevel].push(tile);
                } else if (currentZoomLevel > tileProvider.minZoomLevel) {
                    parents.push(MapView.parent([i, j]));
                }
            }
            currentZoomLevel -= 1;
            current = parents;
            parents = [];
        }
        return tiles;
    }

    static generateTilesList([x, y], [width, height], scale, tileProvider) {
        let startTile = {
            i: Math.floor(x / tileProvider.tileWidth / scale),
            j: Math.floor(y / tileProvider.tileHeight / scale)
        };
        let endTile = {
            i: Math.ceil((x + width) / tileProvider.tileWidth / scale),
            j: Math.ceil((y + height) / tileProvider.tileHeight / scale)
        };
        let offset = {
            x: startTile.i * tileProvider.tileWidth * scale - x,
            y: startTile.j * tileProvider.tileHeight * scale - y
        };
        let tiles = [];
        for (let di = 0; di < endTile.i - startTile.i; di++) {
            for (let dj = 0; dj < endTile.j - startTile.j; dj++) {
                tiles.push({
                    i: startTile.i + di,
                    j: startTile.j + dj,
                    top: tileProvider.tileHeight * scale * dj + offset.y,
                    left: tileProvider.tileWidth * scale * di + offset.x,
                    width: tileProvider.tileWidth * scale,
                    height: tileProvider.tileHeight * scale
                });
            }
        }
        return tiles;
    }

    transformMapTilesLayer(layer) {
        const {width, height} = this.state;
        const zoomLevel = Math.round(this.props.view.zoom);
        const scale = Math.pow(2, this.props.view.zoom - zoomLevel);
        const {x, y} = VectorUtil.multiply(this.props.view, Math.pow(2, zoomLevel - Math.floor(this.props.view.zoom)));

        let tileProvider = layer.props.tileProvider;

        let isLoaded = (i, j, zoomLevel) => {
            let source = tileProvider.getTileUrl(i, j, zoomLevel, layer.props.style);
            return this.props.imageFrontier.isLoaded(source);
        };

        let topLeft = {
            x: x - width / 2 / scale,
            y: y - height / 2 / scale
        };

        let displayTiles = [];
        let tiles = MapView.generateTilesList([topLeft.x, topLeft.y], [width, height], 1, tileProvider);
        for (let tile of tiles) {
            if (isLoaded(tile.i, tile.j, zoomLevel)) {
                displayTiles.push(tile);
            } else {
                let parent = MapView.parent([tile.i, tile.j]);
                let currentZoomLevel = zoomLevel;
                while (currentZoomLevel-- > tileProvider.minZoomLevel && !isLoaded(parent.i, parent.j, currentZoomLevel)) {
                    parent = MapView.parent(parent);
                    currentZoomLevel -= 1;
                }
                if(isLoaded(parent.i, parent.j, currentZoomLevel)) {
                    displayTiles.push(parent);
                }
            }
        }

        // TODO: lots

        return {
            type: Group,
            props: {
                children: displayTiles.map(({i, j, top, left, width, height}, zoomLevel) => {
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
                    this.props.imageFrontier.fetch(source, 0);
                })
            }
        };
    }

    draw() {
        this.props.imageFrontier.clear();

        let canvasLayers = React.Children.toArray(this.props.children).filter(child => child.props.render == 'canvas');

        this.refs.canvas.draw({
            type: Group,
            props: {
                children: [
                    ...canvasLayers.map(this.transformMapTilesLayer.bind(this)),
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

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    renderMapTilesLayer(layer, mixinProps, view) {
        let layerProps = layer.props || {};
        let newProps = {
            width: this.state.width,
            height: this.state.height,
            ...view
        };
        objectAssign(newProps, layerProps, mixinProps);
        let mapTilesLayerHelper = new MapTilesLayerHelper(newProps);
        return mapTilesLayerHelper.render();
    }

    transformCanvasLayer(view, layer) {
        let center = MapHelper.project(layer.props, view.zoomLevel);
        let offset = VectorUtil.add(VectorUtil.multiply(VectorUtil.subtract(center, view), view.scale), {
            x: this.state.width / 2,
            y: this.state.height / 2
        });
        return {
            type: Translate,
            props: {
                ...offset,
                children: layer.props.children
            }
        };
    }

    renderHtmlLayer(layer, mixinProps, view) {
        let center = MapHelper.project(layer.props, view.zoomLevel);
        let offset = VectorUtil.add(VectorUtil.multiply(VectorUtil.subtract(center, view), view.scale), {
            x: this.state.width / 2,
            y: this.state.height / 2
        });
        return <div style={{position: 'absolute', top: offset.y, left: offset.x}} {...mixinProps}>
            {layer.props.children}
        </div>;
    }

    transformLayer(layer, index) {
        let zoomLevel = Math.round(this.props.view.zoom);
        let scale = Math.pow(2, this.props.view.zoom - zoomLevel);
        let view = VectorUtil.multiply(this.props.view, Math.pow(2, zoomLevel - Math.floor(this.props.view.zoom)));
        view.zoomLevel = zoomLevel;
        view.scale = scale;

        switch (layer.type) {
            case MapTilesLayer:
                return {
                    canvas: true,
                    rendered: this.renderMapTilesLayer(layer, {key: index}, view)
                };
            case MapLayer:
                switch (layer.props.render) {
                    case 'canvas':
                        return {
                            canvas: true,
                            rendered: this.transformCanvasLayer(layer, {key: index}, view)
                        };
                    case 'html':
                        return {
                            canvas: false,
                            rendered: this.renderHtmlLayer(layer, {key: index}, view)
                        };
                    default:
                        console.warn('Unknown layer render target for MapView: ' + layer.props.render);
                        break;
                }
                break;
            default:
                console.warn('Unknown layer type for MapView: ' + layer.type);
                break;
        }
    }

    render() {
        //let transformedLayers = React.Children.map(this.props.children, this.transformLayer);
        //let canvasLayers = transformedLayers.filter(transformedLayer => transformedLayer.canvas);
        //let htmlLayers = transformedLayers.filter(transformedLayer => !transformedLayer.canvas);
        //{htmlLayers.map(htmlLayer => htmlLayer.rendered)}

        return <span>
            <MapViewController
                view={this.props.view}
                onViewChange={this.props.onViewChange}
                onLongViewChange={this.props.onLongViewChange}
                onLocationSelect={this.props.onLocationSelect}
                onTap={this.props.onTap}
            >
                <Canvas ref="canvas" width={this.state.width} height={this.state.height}/>
            </MapViewController>
        </span>;
    }
};
