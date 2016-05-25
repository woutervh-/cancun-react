import React from 'react';
import {Base, EPSG3857} from './Geography/CoordinateReferenceSystems';
import {HtmlLayer, TileLayer, TileLayerUrlUtil} from './Layers';
import objectAssign from 'object-assign';
import ImageFrontier from './ImageFrontier';
import Transformation from './Transformation';
import {Canvas, Group, Picture, Rectangle} from './Canvas';
import VectorUtil from '../VectorUtil';
import {Manager} from './Events';
import style from './style';

export default class Map extends React.Component {
    constructor() {
        super();
        this.imageFrontier = new ImageFrontier();
        this.tileLayerUrlUtil = new TileLayerUrlUtil();

        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.drawTileLayers = this.drawTileLayers.bind(this);
        this.transformTileLayer = this.transformTileLayer.bind(this);
        this.halfSize = this.halfSize.bind(this);
        this.pixelBounds = this.pixelBounds.bind(this);
        this.tileRange = this.tileRange.bind(this);
        this.firstLoadedAncestor = this.firstLoadedAncestor.bind(this);
        this.transformHtmlLayer = this.transformHtmlLayer.bind(this);
        this.center = this.center.bind(this);
        this.zoomLevel = this.zoomLevel.bind(this);
        this.zoom = this.zoom.bind(this);
        this.scale = this.scale.bind(this);
        this.pushViewUpdate = this.pushViewUpdate.bind(this);
        this.getTileUrl = this.getTileUrl.bind(this);
        this.handleMoveStart = this.handleMoveStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleMoveEnd = this.handleMoveEnd.bind(this);
        this.handlePinchStart = this.handlePinchStart.bind(this);
        this.handlePinch = this.handlePinch.bind(this);
        this.handlePinchEnd = this.handlePinchEnd.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleDoubleTap = this.handleDoubleTap.bind(this);
        this.handleTwoFingerTap = this.handleTwoFingerTap.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.screenToContainer = this.screenToContainer.bind(this);
        this.moveMapBy = this.moveMapBy.bind(this);
        this.setZoomAround = this.setZoomAround.bind(this);
    }

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        center: React.PropTypes.shape({
            latitude: React.PropTypes.number.isRequired,
            longitude: React.PropTypes.number.isRequired
        }).isRequired,
        zoom: React.PropTypes.number.isRequired,
        minZoom: React.PropTypes.number.isRequired,
        maxZoom: React.PropTypes.number.isRequired,
        crs: React.PropTypes.instanceOf(Base).isRequired,
        onViewChange: React.PropTypes.func.isRequired,
        contextMenuTime: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        center: {latitude: 0, longitude: 0},
        zoom: 0,
        minZoom: 0,
        maxZoom: 18,
        crs: new EPSG3857(),
        onViewChange: () => {
        },
        contextMenuTime: 250
    };

    state = {
        dLatitude: 0,
        dLongitude: 0,
        dZoom: 0
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.width != nextProps.width
            || this.props.height != nextProps.height
            || this.props.center != nextProps.center
            || this.props.zoom != nextProps.zoom
            || this.props.crs != nextProps.crs
            || this.props.children != nextProps.children
            || this.state.dLatitude != nextState.dLatitude
            || this.state.dLongitude != nextState.dLongitude
            || this.state.dZoom != nextState.dZoom
            || this.state.debug != nextState.debug;
    }

    componentDidMount() {
        this.manager = new Manager(this.refs.canvas.getElement());
        this.manager.on('movestart', this.handleMoveStart);
        this.manager.on('move', this.handleMove);
        this.manager.on('moveend', this.handleMoveEnd);
        this.manager.on('pinchstart', this.handlePinchStart);
        this.manager.on('pinch', this.handlePinch);
        this.manager.on('pinchend', this.handlePinchEnd);
        this.manager.on('wheel', this.handleWheel);
        this.manager.on('doubletap', this.handleDoubleTap);
        this.manager.on('twofingertap', this.handleTwoFingerTap);
        this.manager.on('contextmenu', this.handleContextMenu);

        this.drawTileLayers();
    }

    componentDidUpdate(prevProps) {
        if (this.props.center != prevProps.center) {
            this.setState({
                dLatitude: 0,
                dLongitude: 0
            });
        }

        if (this.props.zoom != prevProps.zoom) {
            this.setState({
                dZoom: 0
            });
        }

        this.drawTileLayers();
    }

    componentWillUnmount() {
        this.manager.destroy();
        this.manager = null;
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

        let origin = VectorUtil.round(this.pixelBounds().min);
        let tileSize = this.props.crs.tileSize();
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

    halfSize() {
        return {
            width: this.props.width / this.scale() / 2,
            height: this.props.height / this.scale() / 2
        };
    }

    pixelBounds() {
        let pixelCenter = this.props.crs.coordinateToPoint(this.center(), this.zoomLevel());
        let halfSize = this.halfSize();
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
        let tileSize = this.props.crs.tileSize();
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
        let layerCenter = this.props.crs.coordinateToPoint(layer.props, this.zoomLevel());
        let mapCenter = this.props.crs.coordinateToPoint(this.props);
        let offset = {
            x: (layerCenter.x - mapCenter.x) * this.scale() + width / 2,
            y: (layerCenter.y - mapCenter.y) * this.scale() + height / 2
        };
        return <div key={index} style={{position: 'absolute', top: offset.y, left: offset.x}}>
            {layer.props.children}
        </div>;
    }

    center() {
        return {
            latitude: this.props.center.latitude + this.state.dLatitude,
            longitude: this.props.center.longitude + this.state.dLongitude
        };
    }

    zoomLevel() {
        return Math.round(this.zoom());
    }

    zoom() {
        return this.props.zoom + this.state.dZoom;
    }

    scale() {
        return Math.pow(2, this.zoom() - this.zoomLevel());
    }

    pushViewUpdate() {
        this.props.onViewChange({
            center: this.center(),
            zoomLevel: this.zoomLevel()
        });
    }

    getTileUrl(layer, {i, j, zoomLevel}) {
        zoomLevel = Math.max(layer.props.minZoom, Math.min(layer.props.maxZoom, zoomLevel));
        let countTiles = Math.pow(2, zoomLevel);
        i = (i % countTiles + countTiles) % countTiles;
        j = (j % countTiles + countTiles) % countTiles;
        return this.tileLayerUrlUtil.getTileUrl(layer, i, j, zoomLevel);
    }

    handleMoveStart(event) {
        let {clientX: x, clientY: y} = event.pointers[0];
        document.body.classList.add(style['unselectable']);
        this.move = {x, y};
    }

    handleMove(event) {
        let {clientX: x, clientY: y} = event.pointers[0];
        let dx = x - this.move.x;
        let dy = y - this.move.y;
        this.move = {x, y};
        this.moveMapBy({x: -dx, y: -dy});
    }

    handleMoveEnd() {
        document.body.classList.remove(style['unselectable']);
        this.pushViewUpdate();
    }

    handlePinchStart(event) {
        let p1 = {x: event.pointers[0].clientX, y: event.pointers[0].clientY};
        let p2 = {x: event.pointers[1].clientX, y: event.pointers[1].clientY};
        let pointer = this.screenToContainer(VectorUtil.divide(VectorUtil.add(p1, p2), 2));
        let distance = VectorUtil.distance(p1, p2);
        let zoom = this.zoom();
        this.pinch = {pointer, distance, zoom};
    }

    handlePinch(event) {
        let p1 = {x: event.pointers[0].clientX, y: event.pointers[0].clientY};
        let p2 = {x: event.pointers[1].clientX, y: event.pointers[1].clientY};
        let pointer = this.screenToContainer(VectorUtil.divide(VectorUtil.add(p1, p2), 2));
        let distance = VectorUtil.distance(p1, p2);
        let zoom = this.pinch.zoom + Math.log2(distance / this.pinch.distance);
        this.pinch = {pointer, distance, zoom};
        this.setZoomAround(pointer, zoom);
    }

    handlePinchEnd(event) {

    }

    handleWheel(event) {
        let {x, y} = this.screenToContainer({x: event.clientX, y: event.clientY});
        if (event.deltaY < 0 && this.zoom() < this.props.maxZoom) {
            let newZoom = Math.min(this.props.maxZoom, this.zoom() + 1);
            this.setZoomAround({x, y}, newZoom);
        } else if (event.deltaY > 0 && this.zoom() > this.props.minZoom) {
            let newZoom = Math.max(this.props.minZoom, this.zoom() - 1);
            this.setZoomAround({x, y}, newZoom);
        }
    }

    handleDoubleTap(event) {
        let {x, y} = this.screenToContainer({x: event.pointers[0].clientX, y: event.pointers[0].clientY});
        if (this.zoom() < this.props.maxZoom) {
            let newZoom = Math.min(this.props.maxZoom, this.zoom() + 1);
            this.setZoomAround({x, y}, newZoom);
        }
    }

    handleTwoFingerTap(event) {
        let {x, y} = this.screenToContainer({x: event.pointers[0].clientX, y: event.pointers[0].clientY});
        if (this.zoom() > this.props.minZoom) {
            let newZoom = Math.max(this.props.minZoom, this.zoom() - 1);
            this.setZoomAround({x, y}, newZoom);
        }
    }

    handleContextMenu(event) {
        if (!!this.contextMenuTimer) {
            clearTimeout(this.contextMenuTimer);
            this.contextMenuTimer = null;

            let {x, y} = this.screenToContainer({x: event.clientX, y: event.clientY});
            if (this.zoom() > this.props.minZoom) {
                let newZoom = Math.max(this.props.minZoom, this.zoom() - 1);
                this.setZoomAround({x, y}, newZoom);
            }
        } else {
            this.contextMenuTimer = setTimeout(() => {
                this.contextMenuTimer = null;
                console.log('show menu')
            }, this.props.contextMenuTime);
        }

        event.preventDefault();
    }

    screenToContainer(point, container = this.refs.canvas.getElement()) {
        let containerOffset = {x: container.offsetLeft, y: container.offsetTop};
        let parent = container.offsetParent;
        while (parent != null) {
            containerOffset.x += parent.offsetLeft;
            containerOffset.y += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return VectorUtil.subtract(point, containerOffset);
    }

    moveMapBy(pixelAmount) {
        let oldCenter = this.center();
        let oldCenterPoint = this.props.crs.coordinateToPoint(oldCenter, this.zoomLevel());
        let newCenterPoint = this.props.crs.wrapPoint(VectorUtil.add(oldCenterPoint, pixelAmount), this.zoomLevel());
        let newCenter = this.props.crs.pointToCoordinate(newCenterPoint, this.zoomLevel());
        this.setState({
            dLatitude: this.state.dLatitude + newCenter.latitude - oldCenter.latitude,
            dLongitude: this.state.dLongitude + newCenter.longitude - oldCenter.longitude
        });
    }

    setZoomAround(containerPoint, zoom) {
        let halfSize = this.halfSize();
        let scale = this.props.crs.scale(zoom) / this.props.crs.scale(this.zoom());
        let offset = {
            x: (containerPoint.x - halfSize.width) * (1 - 1 / scale),
            y: (containerPoint.y - halfSize.height) * (1 - 1 / scale)
        };
        this.moveMapBy(offset);
        this.setState({
            dZoom: this.state.dZoom + zoom - this.zoom()
        });
    }

    render() {
        let {width, height, center, zoomLevel, crs, children, style, ...other} = this.props;
        let rootStyle = objectAssign({}, {position: 'absolute'}, style);

        return <div style={rootStyle} {...other}>
            <Canvas ref="canvas" width={width} height={height} style={{position: 'absolute'}}>
                Your browser does not support the HTML5 canvas tag.
            </Canvas>
            <pre style={{position: 'fixed', top: 0, left: 0}}>
                {JSON.stringify(this.state.debug, null, 2)}
            </pre>
        </div>;

        //<div ref="htmlLayers" style={{position: 'absolute', overflow: 'hidden', top: this.state.dy, left: this.state.dx, width, height}}>
        //    {React.Children.toArray(children).filter(child => child.type == HtmlLayer).map(this.transformHtmlLayer.bind(this))}
        //</div>
    }
};
