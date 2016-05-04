import MapHelper from './MapHelper';
import MapLayer from './MapLayer';
import MapTilesLayer from './MapTilesLayer';
import MapTilesLayerHelper from './MapTilesLayerHelper';
import MapViewController from './MapViewController';
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
        view: React.PropTypes.shape({
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired,
            zoom: React.PropTypes.number.isRequired
        }).isRequired,
        onViewChange: React.PropTypes.func.isRequired,
        onLongViewChange: React.PropTypes.func.isRequired,
        onLocationSelect: React.PropTypes.func.isRequired,
        onTap: React.PropTypes.func.isRequired
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
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
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
        Object.assign(newProps, layerProps, mixinProps);
        let mapTilesLayerHelper = new MapTilesLayerHelper(newProps);
        return mapTilesLayerHelper.render();
    }

    renderCanvasLayer(layer, mixinProps, view) {
        let center = MapHelper.project(layer.props, view.zoomLevel);
        let offset = VectorUtil.add(VectorUtil.multiply(VectorUtil.subtract(center, view), view.scale), {
            x: this.state.width / 2,
            y: this.state.height / 2
        });
        return <Translate {...offset} {...mixinProps}>
            {layer.props.children}
        </Translate>;
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
                            rendered: this.renderCanvasLayer(layer, {key: index}, view)
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
        let transformedLayers = React.Children.map(this.props.children, this.transformLayer);
        let canvasLayers = transformedLayers.filter(transformedLayer => transformedLayer.canvas);
        let htmlLayers = transformedLayers.filter(transformedLayer => !transformedLayer.canvas);

        return <span>
            <MapViewController
                view={this.props.view}
                onViewChange={this.props.onViewChange}
                onLongViewChange={this.props.onLongViewChange}
                onLocationSelect={this.props.onLocationSelect}
                onTap={this.props.onTap}
            >
                <Canvas ref="canvas" width={this.state.width} height={this.state.height}>
                    <Composition type="destination-over">
                        {canvasLayers.reverse().map(canvasLayer => canvasLayer.rendered)}
                    </Composition>
                    <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
                </Canvas>
            </MapViewController>
            {htmlLayers.map(htmlLayer => htmlLayer.rendered)}
        </span>;
    }
};
