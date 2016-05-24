import React from 'react';
import {Base, EPSG3857} from './Geography/CoordinateReferenceSystems';
import {HtmlLayer, TileLayer, TileLayerUrlUtil} from './Layers';
import objectAssign from 'object-assign';
import ImageFrontier from './ImageFrontier';
import Transformation from './Transformation';
import {Canvas, Group, Picture, Rectangle} from './Canvas';
import VectorUtil from '../VectorUtil';

export default class Map extends React.Component {
    constructor() {
        super();
        this.imageFrontier = new ImageFrontier();
        this.tileLayerUrlUtil = new TileLayerUrlUtil();

        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.drawTileLayers = this.drawTileLayers.bind(this);
        this.transformTileLayer = this.transformTileLayer.bind(this);
        this.pixelBounds = this.pixelBounds.bind(this);
        this.tileRange = this.tileRange.bind(this);
        this.firstLoadedAncestor = this.firstLoadedAncestor.bind(this);
        this.transformHtmlLayer = this.transformHtmlLayer.bind(this);
        this.zoomLevel = this.zoomLevel.bind(this);
        this.scale = this.scale.bind(this);
        this.getTileUrl = this.getTileUrl.bind(this);
    }

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        center: React.PropTypes.shape({
            latitude: React.PropTypes.number.isRequired,
            longitude: React.PropTypes.number.isRequired
        }).isRequired,
        zoom: React.PropTypes.number.isRequired,
        coordinateReferenceSystem: React.PropTypes.instanceOf(Base).isRequired
    };

    static defaultProps = {
        center: {latitude: 0, longitude: 0},
        zoom: 0,
        coordinateReferenceSystem: new EPSG3857()
    };

    shouldComponentUpdate(nextProps) {
        return this.props.width != nextProps.width
            || this.props.height != nextProps.height
            || this.props.center != nextProps.center
            || this.props.zoom != nextProps.zoom
            || this.props.coordinateReferenceSystem != nextProps.coordinateReferenceSystem
            || this.props.children != nextProps.children;
    }

    componentDidMount() {
        this.drawTileLayers();
    }

    componentDidUpdate() {
        this.drawTileLayers();
    }

    drawTileLayers() {
        this.imageFrontier.clear();
        let layers = React.Children.toArray(this.props.children).filter(child => child.type == TileLayer);
        let transformedLayers = layers.map(this.transformTileLayer);

        this.refs.canvas.draw({
            type: Group,
            props: {
                children: [
                    ...transformedLayers,
                    {
                        type: Rectangle,
                        props: {
                            width: this.props.width,
                            height: this.props.height,
                            strokeStyle: 'rgba(255, 0, 0, 1)',
                            fillStyle: 'rgba(0, 0, 0, 0)'
                        }
                    }
                ]
            }
        });
    }

    transformTileLayer(layer) {
        let tileRange = this.tileRange(this.pixelBounds());
        let tileCenter = {
            x: (tileRange.min.x + tileRange.max.x) / 2,
            y: (tileRange.min.y + tileRange.max.y) / 2
        };
        let zoomLevel = this.zoomLevel();
        let displayTiles = [];
        let toLoadTiles = [];
        for (let i = tileRange.min.x; i <= tileRange.max.x; i++) {
            for (let j = tileRange.min.y; j <= tileRange.max.y; j++) {
                let ancestor = this.firstLoadedAncestor(layer, i, j, zoomLevel);
                if (!!ancestor && ancestor.i == i && ancestor.j == j && ancestor.zoomLevel == zoomLevel) {
                    displayTiles.push(ancestor);
                } else {
                    toLoadTiles.push({i, j, zoomLevel});
                    if (!!ancestor && layer.props.displayCachedTiles) {
                        displayTiles.push(ancestor);
                    }
                }
            }
        }

        let priority = 0;
        toLoadTiles.sort((a, b) => VectorUtil.distance2({x: a.i, y: a.j}, tileCenter) - VectorUtil.distance2({x: b.i, y: b.j}, tileCenter)).forEach(tile => {
            let source = this.getTileUrl(layer, tile);
            this.imageFrontier.fetch(source, priority--, this.drawTileLayers);
        });

        let origin = this.pixelBounds().min;
        let tileSize = this.props.coordinateReferenceSystem.tileSize();
        let pictures = displayTiles.map(tile => {
            let source = this.getTileUrl(layer, tile);
            let image = this.imageFrontier.getLoadedImage(source);
            let scale = this.scale() * Math.pow(2, zoomLevel - tile.zoomLevel);
            let topLeft = VectorUtil.subtract(VectorUtil.multiply({x: tile.i, y: tile.j}, scale * tileSize), origin);
            return {
                type: Picture,
                props: {
                    image,
                    top: topLeft.y,
                    left: topLeft.x,
                    width: tileSize * scale,
                    height: tileSize * scale
                }
            };
        });

        return {
            type: Group,
            props: {
                children: pictures
            }
        };
    }

    pixelBounds() {
        let pixelCenter = this.props.coordinateReferenceSystem.coordinateToPoint(this.props.center, this.zoomLevel());
        let halfSize = {
            width: this.props.width / this.scale() / 2,
            height: this.props.height / this.scale() / 2
        };
        return {
            min: {
                x: pixelCenter.x - halfSize.width,
                y: pixelCenter.y - halfSize.height
            },
            max: {
                x: pixelCenter.x + halfSize.width,
                y: pixelCenter.y + halfSize.height
            }
        };
    }

    tileRange(pixelBounds) {
        let tileSize = this.props.coordinateReferenceSystem.tileSize();
        return {
            min: VectorUtil.floor(VectorUtil.divide(pixelBounds.min, tileSize)),
            max: VectorUtil.subtract(VectorUtil.ceil(VectorUtil.divide(pixelBounds.max, tileSize)), {x: 1, y: 1})
        };
    }

    firstLoadedAncestor(layer, i, j, zoomLevel) {
        let source = this.getTileUrl(layer, {i, j, zoomLevel});
        if (this.imageFrontier.isLoaded(source)) {
            return {i, j, zoomLevel};
        } else if (zoomLevel > layer.props.minZoom) {
            return this.firstLoadedAncestor(layer, Math.floor(i / 2), Math.floor(j / 2), zoomLevel - 1);
        } else {
            return null;
        }
    }

    transformHtmlLayer(layer, index) {
        let {width, height} = this.props;
        let layerCenter = this.props.coordinateReferenceSystem.coordinateToPoint(layer.props, this.zoomLevel());
        let mapCenter = this.props.coordinateReferenceSystem.coordinateToPoint(this.props);
        let offset = {
            x: (layerCenter.x - mapCenter.x) * this.scale() + width / 2,
            y: (layerCenter.y - mapCenter.y) * this.scale() + height / 2
        };
        return <div key={index} style={{position: 'absolute', top: offset.y, left: offset.x}}>
            {layer.props.children}
        </div>;
    }

    zoomLevel() {
        return Math.round(this.props.zoom);
    }

    scale() {
        return Math.pow(2, this.props.zoom - this.zoomLevel());
    }

    getTileUrl(layer, {i, j, zoomLevel}) {
        zoomLevel = Math.max(layer.props.minZoom, Math.min(layer.props.maxZoom, zoomLevel));
        let countTiles = Math.pow(2, zoomLevel);
        i = (i % countTiles + countTiles) % countTiles;
        j = (j % countTiles + countTiles) % countTiles;
        return this.tileLayerUrlUtil.getTileUrl(layer, i, j, zoomLevel);
    }

    render() {
        let {width, height, center, zoomLevel, coordinateReferenceSystem, children, style, ...other} = this.props;
        let rootStyle = objectAssign({}, {position: 'absolute'}, style);

        return <div style={rootStyle} {...other}>
            <Canvas ref="canvas" width={width} height={height} style={{position: 'absolute', width, height}}>
                Your browser does not support the HTML5 canvas tag.
            </Canvas>
        </div>;

        //<div ref="htmlLayers" style={{position: 'absolute', overflow: 'hidden', top: this.state.dy, left: this.state.dx, width, height}}>
        //    {React.Children.toArray(children).filter(child => child.type == HtmlLayer).map(this.transformHtmlLayer.bind(this))}
        //</div>
    }
};
