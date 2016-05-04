import MapHelper from './MapHelper';
import MapLayer from './MapLayer';
import MapTilesLayer from './MapTilesLayer';
import MapTilesLayerHelper from './MapTilesLayerHelper';
import React from 'react';
import {Canvas, Composition, Picture, Rectangle, Scale, Translate} from './canvas';
import VectorUtil from '../VectorUtil';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.transformLayer = this.transformLayer.bind(this);
    }

    static propTypes = {
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
        zoomLevel: React.PropTypes.number.isRequired,
        scale: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        scale: 1
    };

    state = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.x != nextProps.x
            || this.props.y != nextProps.y
            || this.props.zoomLevel != nextProps.zoomLevel
            || this.props.scale != nextProps.scale
            || this.props.children != nextProps.children
            || this.state.width != nextState.width
            || this.state.height != nextState.height;
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    renderMapTilesLayer(layer, mixinProps = {}) {
        let layerProps = layer.props || {};
        let newProps = {
            width: this.state.width,
            height: this.state.height,
            x: this.props.x,
            y: this.props.y,
            zoomLevel: this.props.zoomLevel,
            scale: this.props.scale
        };
        Object.assign(newProps, layerProps, mixinProps);
        let mapTilesLayerHelper = new MapTilesLayerHelper(newProps);
        return mapTilesLayerHelper.render();
    }

    renderCanvasLayer(layer, mixinProps = {}) {
        let center = MapHelper.project(layer.props, this.props.zoomLevel);
        let offset = VectorUtil.add(VectorUtil.subtract(center, this.props), {
            x: this.state.width / 2 / this.props.scale,
            y: this.state.height / 2 / this.props.scale
        });
        return <Translate {...offset} {...mixinProps}>
            <Scale scaleWidth={1 / this.props.scale} scaleHeight={1 / this.props.scale}>
                {layer.props.children}
            </Scale>
        </Translate>;
    }

    renderHtmlLayer(layer, mixinProps = {}) {
        let center = MapHelper.project(layer.props, this.props.zoomLevel);
        let offset = VectorUtil.add(VectorUtil.subtract(center, this.props), {
            x: this.state.width / 2 / this.props.scale,
            y: this.state.height / 2 / this.props.scale
        });
        return <div style={{position: 'absolute', top: offset.y, left: offset.x}} {...mixinProps}>
            {layer.props.children}
        </div>;
    }

    transformLayer(layer, index) {
        switch (layer.type) {
            case MapTilesLayer:
                return {canvas: true, rendered: this.renderMapTilesLayer(layer, {key: index})};
            case MapLayer:
                switch (layer.props.render) {
                    case 'canvas':
                        return {canvas: true, rendered: this.renderCanvasLayer(layer, {key: index})};
                    case 'html':
                        return {canvas: false, rendered: this.renderHtmlLayer(layer, {key: index})};
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
        let transformedLayers = React.Children.map(this.props.children, this.transformLayer);
        let canvasLayers = transformedLayers.filter(transformedLayer => transformedLayer.canvas);
        let htmlLayers = transformedLayers.filter(transformedLayer => !transformedLayer.canvas);

        return <span>
            <Canvas ref="canvas" width={this.state.width} height={this.state.height}>
                <Composition type="destination-over">
                    {canvasLayers.reverse().map(canvasLayer => canvasLayer.rendered)}
                </Composition>
                <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
            </Canvas>
            {htmlLayers.map(htmlLayer => htmlLayer.rendered)}
        </span>;
    }
};
