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
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    static generateTilesHierarchy({x, y} = {}, {width, height} = {}, zoomLevel) {
        let hierarchy = [];
        for (let i = zoomLevel; i >= MapHelper.minZoomLevel; i--) {
            let scale = Math.pow(2, i - zoomLevel);
            let startTile = {
                x: Math.floor(x / MapHelper.tileWidth * scale),
                y: Math.floor(y / MapHelper.tileHeight * scale)
            };
            let endTile = {
                x: Math.ceil((x + width) / MapHelper.tileWidth * scale),
                y: Math.ceil((y + height) / MapHelper.tileHeight * scale)
            };
            let offset = {
                x: startTile.x * MapHelper.tileWidth / scale - x,
                y: startTile.y * MapHelper.tileHeight / scale - y
            };
            let tiles = {};
            for (let dx = 0; dx < endTile.x - startTile.x; dx++) {
                for (let dy = 0; dy < endTile.y - startTile.y; dy++) {
                    tiles[[startTile.x + dx, startTile.y + dy]] = {
                        top: MapHelper.tileHeight / scale * dy + offset.y,
                        left: MapHelper.tileWidth / scale * dx + offset.x,
                        scale
                    };
                }
            }
            hierarchy[i] = tiles;
            x = Math.floor(x / 2);
            y = Math.floor(y / 2);
            width /= 2;
            height /= 2;
        }
        return hierarchy;
    }

    transformMapTilesLayer(layer) {
        let {width, height} = this.state;
        let zoomLevel = Math.round(this.props.view.zoom);
        let scale = Math.pow(2, this.props.view.zoom - zoomLevel);
        let {x, y} = VectorUtil.multiply(this.props.view, Math.pow(2, zoomLevel - Math.floor(this.props.view.zoom)));

        let topLeft = {
            x: x - width / 2 / scale,
            y: y - height / 2 / scale
        };

        let hierarchy = MapView.generateTilesHierarchy({x, y}, {width, height}, zoomLevel);

        let center = MapHelper.project(layer.props, view.zoomLevel);
        let offset = VectorUtil.add(VectorUtil.multiply(VectorUtil.subtract(center, view), view.scale), {
            x: this.state.width / 2,
            y: this.state.height / 2
        });
        return {
            type: Translate,
            props: {
                ...offset,
                children: hierarchy[zoomLevel].map(tile => ({
                    type: Picture,
                    props: {
                        source: 1,
                        top: tile.top,
                        left: tile.left,
                        width: MapHelper.tileWidth / tile.scale,
                        height: MapHelper.tileHeight / tile.scale
                    }
                }))
            }
        };

        //layer.props.children = [];
        //this.transformCanvasLayer(view, layer);
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
