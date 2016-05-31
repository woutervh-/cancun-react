import React from 'react';
import {Base, EPSG3857} from './Geography/CoordinateReferenceSystems';
import {HtmlLayer, HtmlPopup, Marker, TileLayer, TileLayerUrlUtil} from './Layers';
import objectAssign from 'object-assign';
import ImageFrontier from './ImageFrontier';
import Transformation from './Transformation';
import {Canvas, Group, Picture, Rectangle, Scale} from './Canvas';
import VectorUtil from '../VectorUtil';
import {Manager} from './Events';
import style from './style';

export default class Map extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.drawCanvasLayers = this.drawCanvasLayers.bind(this);
        this.transformMarkerLayers = this.transformMarkerLayers.bind(this);
        this.transformTileLayers = this.transformTileLayers.bind(this);
        this.transformTileLayer = this.transformTileLayer.bind(this);
        this.halfSize = this.halfSize.bind(this);
        this.pixelBounds = this.pixelBounds.bind(this);
        this.tileRange = this.tileRange.bind(this);
        this.firstLoadedAncestor = this.firstLoadedAncestor.bind(this);
        this.transformHtmlLayers = this.transformHtmlLayers.bind(this);
        this.center = this.center.bind(this);
        this.zoomLevel = this.zoomLevel.bind(this);
        this.zoom = this.zoom.bind(this);
        this.scale = this.scale.bind(this);
        this.pushViewUpdate = this.pushViewUpdate.bind(this);
        this.getTileUrl = this.getTileUrl.bind(this);
        this.handleMoveStart = this.handleMoveStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleMoveEnd = this.handleMoveEnd.bind(this);
        this.handleBoxStart = this.handleBoxStart.bind(this);
        this.handleBox = this.handleBox.bind(this);
        this.handleBoxEnd = this.handleBoxEnd.bind(this);
        this.handlePinchStart = this.handlePinchStart.bind(this);
        this.handlePinch = this.handlePinch.bind(this);
        this.handlePinchEnd = this.handlePinchEnd.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleTap = this.handleTap.bind(this);
        this.handleDoubleTap = this.handleDoubleTap.bind(this);
        this.handleTwoFingerTap = this.handleTwoFingerTap.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handlePress = this.handlePress.bind(this);
        this.screenToContainer = this.screenToContainer.bind(this);
        this.containerToPixel = this.containerToPixel.bind(this);
        this.moveMapBy = this.moveMapBy.bind(this);
        this.setPositionTo = this.setPositionTo.bind(this);
        this.setZoomTo = this.setZoomTo.bind(this);
        this.setZoomAround = this.setZoomAround.bind(this);
        this.setZoomAt = this.setZoomAt.bind(this);

        this.imageFrontier = new ImageFrontier();
        this.tileLayerUrlUtil = new TileLayerUrlUtil();
        this.manager = null;
        this.moving = false;
        this.pinching = false;
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
        onTap: React.PropTypes.func.isRequired,
        onViewChange: React.PropTypes.func.isRequired,
        onLocationSelect: React.PropTypes.func.isRequired,
        contextMenuTime: React.PropTypes.number.isRequired,
        pinchZoomJumpThreshold: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        center: {latitude: 0, longitude: 0},
        zoom: 0,
        minZoom: 0,
        maxZoom: 18,
        crs: new EPSG3857(),
        onTap: () => {
        },
        onViewChange: () => {
        },
        onLocationSelect: () => {
        },
        contextMenuTime: 250,
        pinchZoomJumpThreshold: 0.2
    };

    state = {
        dLatitude: 0,
        dLongitude: 0,
        dZoom: 0,
        box: {
            show: false,
            start: {x: 0, y: 0},
            end: {x: 0, y: 0}
        }
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
            || this.state.box != nextState.box;
    }

    componentDidMount() {
        this.manager = new Manager(this.refs.canvas.getElement());
        this.manager.on('movestart', this.handleMoveStart);
        this.manager.on('move', this.handleMove);
        this.manager.on('moveend', this.handleMoveEnd);
        this.manager.on('boxstart', this.handleBoxStart);
        this.manager.on('box', this.handleBox);
        this.manager.on('boxend', this.handleBoxEnd);
        this.manager.on('pinchstart', this.handlePinchStart);
        this.manager.on('pinch', this.handlePinch);
        this.manager.on('pinchend', this.handlePinchEnd);
        this.manager.on('wheel', this.handleWheel);
        this.manager.on('tap', this.handleTap);
        this.manager.on('doubletap', this.handleDoubleTap);
        this.manager.on('twofingertap', this.handleTwoFingerTap);
        this.manager.on('contextmenu', this.handleContextMenu);
        this.manager.on('press', this.handlePress);

        this.drawCanvasLayers();
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

        this.drawCanvasLayers();
    }

    componentWillUnmount() {
        this.manager.destroy();
        this.manager = null;
    }

    drawCanvasLayers() {
        /* todo: optimize by drawing on raf and if dirty */
        this.imageFrontier.clear();
        let layers = React.Children.toArray(this.props.children);
        let tileLayers = this.transformTileLayers(layers.filter(child => child.type == TileLayer));
        let markerLayers = this.transformMarkerLayers(layers.filter(child => child.type == Marker));

        this.refs.canvas.draw({
            type: Group,
            props: {
                children: [
                    ...tileLayers,
                    ...markerLayers,
                    this.state.box.show ? {
                        type: Rectangle,
                        props: {
                            top: this.state.box.start.y,
                            left: this.state.box.start.x,
                            width: this.state.box.end.x - this.state.box.start.x,
                            height: this.state.box.end.y - this.state.box.start.y,
                            strokeStyle: 'rgba(189, 215, 49, 1)',
                            fillStyle: 'rgba(189, 215, 49, 0.25)'
                        }
                    } : null, {
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

    transformMarkerLayers(layers) {
        let priority = 1;
        let pictures = [];
        for (let layer of layers) {
            let {source, width, height, position, anchor} = layer.props;
            if (this.imageFrontier.isLoaded(source)) {
                let image = this.imageFrontier.getLoadedImage(source);
                let point = this.props.crs.coordinateToPoint(position, this.zoomLevel());
                let offset = VectorUtil.multiply(this.pixelToContainer(point), this.scale());
                pictures.push({
                    type: Picture,
                    props: {
                        image,
                        width,
                        height,
                        top: offset.y - anchor.y,
                        left: offset.x - anchor.x
                    }
                });
            } else {
                this.imageFrontier.fetch(source, priority++, this.drawCanvasLayers);
            }
        }
        return pictures;
    }

    transformTileLayers(layers) {
        return layers.map(this.transformTileLayer);
    }

    transformTileLayer(layer) {
        let tileRange = this.tileRange(this.pixelBounds());
        let tileCenter = {
            x: (tileRange.min.x + tileRange.max.x) / 2,
            y: (tileRange.min.y + tileRange.max.y) / 2
        };
        let zoomLevel = this.zoomLevel();
        let displayTiles = {};
        let toLoadTiles = [];
        for (let i = tileRange.min.x; i <= tileRange.max.x; i++) {
            for (let j = tileRange.min.y; j <= tileRange.max.y; j++) {
                let ancestor = this.firstLoadedAncestor(layer, i, j, zoomLevel);
                if (!!ancestor && ancestor.i == i && ancestor.j == j && ancestor.zoomLevel == zoomLevel) {
                    displayTiles[[ancestor.i, ancestor.j, ancestor.zoomLevel]] = ancestor;
                } else {
                    toLoadTiles.push({i, j, zoomLevel});
                    if (!!ancestor && layer.props.displayCachedTiles) {
                        displayTiles[[ancestor.i, ancestor.j, ancestor.zoomLevel]] = ancestor;
                    }
                }
            }
        }

        let priority = 0;
        toLoadTiles.sort((a, b) => VectorUtil.distance2({x: a.i, y: a.j}, tileCenter) - VectorUtil.distance2({x: b.i, y: b.j}, tileCenter)).forEach(tile => {
            let source = this.getTileUrl(layer, tile);
            this.imageFrontier.fetch(source, priority--, this.drawCanvasLayers);
        });

        let origin = VectorUtil.round(this.pixelBounds().min);
        let tileSize = this.props.crs.tileSize();
        let pictures = Object.keys(displayTiles).map(key => displayTiles[key]).sort((a, b) => a.zoomLevel - b.zoomLevel).map(tile => {
            let source = this.getTileUrl(layer, tile);
            let image = this.imageFrontier.getLoadedImage(source);
            let scale = Math.pow(2, zoomLevel - tile.zoomLevel);
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
            type: Scale,
            props: {
                scaleWidth: this.scale(),
                scaleHeight: this.scale(),
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

    transformHtmlLayers(layers) {
        return layers.map((layer, index) => {
            let point = this.props.crs.coordinateToPoint(layer.props.position, this.zoomLevel());
            let offset = VectorUtil.multiply(this.pixelToContainer(point), this.scale());
            return React.cloneElement(layer, {offset});
        });
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
            zoom: this.zoom()
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
        if (!this.moving && !this.pinching) {
            this.moving = true;

            let {clientX: x, clientY: y} = event.pointers[0];
            document.body.classList.add(style['unselectable']);
            this.move = {x, y};
        }
    }

    handleMove(event) {
        if (this.moving) {
            let {clientX: x, clientY: y} = event.pointers[0];
            let dx = x - this.move.x;
            let dy = y - this.move.y;
            this.move = {x, y};
            this.moveMapBy({x: -dx, y: -dy});
        }
    }

    handleMoveEnd() {
        if (this.moving) {
            this.moving = false;

            document.body.classList.remove(style['unselectable']);
            this.pushViewUpdate();
        }
    }

    handleBoxStart(event) {
        let {clientX: x, clientY: y} = event.pointers[0];
        this.setState({
            box: {
                show: true,
                start: {x, y},
                end: {x, y}
            }
        });
    }

    handleBox(event) {
        let {clientX: x, clientY: y} = event.pointers[0];
        this.setState({
            box: {
                ...this.state.box,
                end: {x, y}
            }
        });
    }

    handleBoxEnd() {
        let boxWidth = Math.abs(this.state.box.end.x - this.state.box.start.x);
        let boxHeight = Math.abs(this.state.box.end.y - this.state.box.start.y);
        let boxCenter = this.screenToContainer(VectorUtil.divide(VectorUtil.add(this.state.box.start, this.state.box.end), 2));

        let containerAspectRatio = this.props.width / this.props.height;
        let boxAspectRatio = boxWidth / boxHeight;

        if (containerAspectRatio >= boxAspectRatio) {
            let scale = this.props.height / boxHeight;
            let zoom = Math.min(this.props.maxZoom, Math.max(this.props.minZoom, this.zoom() + Math.log2(scale)));
            this.setZoomAt(boxCenter, zoom, this.pushViewUpdate);
        } else {
            let scale = this.props.width / boxWidth;
            let zoom = Math.min(this.props.maxZoom, Math.max(this.props.minZoom, this.zoom() + Math.log2(scale)));
            this.setZoomAt(boxCenter, zoom, this.pushViewUpdate);
        }

        this.setState({
            box: {
                ...this.state.box,
                show: false
            }
        });
    }

    handlePinchStart(event) {
        if (this.moving) {
            this.moving = false;
        }
        this.pinching = true;

        let p1 = {x: event.pointers[0].clientX, y: event.pointers[0].clientY};
        let p2 = {x: event.pointers[1].clientX, y: event.pointers[1].clientY};
        let pointer = this.screenToContainer(VectorUtil.divide(VectorUtil.add(p1, p2), 2));
        let distance = VectorUtil.distance(p1, p2);
        let zoom = this.zoom();
        this.pinch = {pointer, distance, zoom};
    }

    handlePinch(event) {
        if (this.pinching) {
            let p1 = {x: event.pointers[0].clientX, y: event.pointers[0].clientY};
            let p2 = {x: event.pointers[1].clientX, y: event.pointers[1].clientY};
            let pointer = this.screenToContainer(VectorUtil.divide(VectorUtil.add(p1, p2), 2));
            let distance = VectorUtil.distance(p1, p2);
            let delta = VectorUtil.subtract(this.pinch.pointer, pointer);
            let zoom = Math.min(this.props.maxZoom, Math.max(this.props.minZoom, this.pinch.zoom + Math.log2(distance / this.pinch.distance)));
            this.setZoomAround(pointer, zoom, null, delta);
            this.pinch.pointer = pointer;
        }
    }

    handlePinchEnd() {
        if (this.pinching) {
            this.pinching = false;

            let startZoom = this.pinch.zoom;
            let newZoom = this.zoom();
            if (startZoom < newZoom) {
                newZoom = newZoom - startZoom > this.props.pinchZoomJumpThreshold ? Math.ceil(newZoom) : Math.floor(newZoom);
                newZoom = Math.min(this.props.maxZoom, newZoom);
            } else if (startZoom > newZoom) {
                newZoom = startZoom - newZoom > this.props.pinchZoomJumpThreshold ? Math.floor(newZoom) : Math.ceil(newZoom);
                newZoom = Math.max(this.props.minZoom, newZoom);
            }
            this.setZoomAround(this.pinch.pointer, newZoom, this.pushViewUpdate);
        }
    }

    handleWheel(event) {
        let {x, y} = this.screenToContainer({x: event.clientX, y: event.clientY});
        if (event.deltaY < 0 && this.zoom() < this.props.maxZoom) {
            let newZoom = Math.min(this.props.maxZoom, this.zoom() + 1);
            this.setZoomAround({x, y}, newZoom, this.pushViewUpdate);
        } else if (event.deltaY > 0 && this.zoom() > this.props.minZoom) {
            let newZoom = Math.max(this.props.minZoom, this.zoom() - 1);
            this.setZoomAround({x, y}, newZoom, this.pushViewUpdate);
        }
    }

    handleTap() {
        this.props.onTap();
    }

    handleDoubleTap(event) {
        let {x, y} = this.screenToContainer({x: event.pointers[0].clientX, y: event.pointers[0].clientY});
        if (this.zoom() < this.props.maxZoom) {
            let newZoom = Math.min(this.props.maxZoom, this.zoom() + 1);
            this.setZoomAround({x, y}, newZoom, this.pushViewUpdate);
        }
    }

    handleTwoFingerTap(event) {
        let {x, y} = this.screenToContainer({x: event.pointers[0].clientX, y: event.pointers[0].clientY});
        if (this.zoom() > this.props.minZoom) {
            let newZoom = Math.max(this.props.minZoom, this.zoom() - 1);
            this.setZoomAround({x, y}, newZoom, this.pushViewUpdate);
        }
    }

    handleContextMenu(event) {
        if (!!this.contextMenuTimer) {
            clearTimeout(this.contextMenuTimer);
            this.contextMenuTimer = null;

            let {x, y} = this.screenToContainer({x: event.clientX, y: event.clientY});
            if (this.zoom() > this.props.minZoom) {
                let newZoom = Math.max(this.props.minZoom, this.zoom() - 1);
                this.setZoomAround({x, y}, newZoom, this.pushViewUpdate);
            }
        } else {
            this.contextMenuTimer = setTimeout(() => {
                this.contextMenuTimer = null;
                let {x, y} = this.screenToContainer({x: event.clientX, y: event.clientY});
                let position = this.props.crs.pointToCoordinate(this.containerToPixel({x, y}), this.zoom());
                this.props.onLocationSelect(position, true);
            }, this.props.contextMenuTime);
        }

        event.preventDefault();
    }

    handlePress(event) {
        switch (event.pointerType) {
            case 'mouse':
                let {x, y} = this.screenToContainer({x: event.pointers[0].clientX, y: event.pointers[0].clientY});
                let position = this.props.crs.pointToCoordinate(this.containerToPixel({x, y}), this.zoom());
                this.props.onLocationSelect(position, false);
                break;
            case 'touch':
                /* ignore touch press - it will be handled by the context menu event */
                break;
            default:
                throw new Error('Unknown pointer type for press event: ' + event.pointerType);
        }
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

    containerToPixel({x, y}) {
        let center = this.center();
        let halfSize = this.halfSize();
        let centerPoint = this.props.crs.coordinateToPoint(center, this.zoomLevel());
        let offset = {
            x: x - halfSize.width,
            y: y - halfSize.height
        };
        return VectorUtil.add(centerPoint, offset);
    }

    pixelToContainer({x, y}) {
        let center = this.center();
        let halfSize = this.halfSize();
        let centerPoint = this.props.crs.coordinateToPoint(center, this.zoomLevel());
        let offset = {
            x: x + halfSize.width,
            y: y + halfSize.height
        };
        return VectorUtil.subtract(offset, centerPoint);
    }

    moveMapBy(pixelAmount, callback) {
        let oldCenter = this.center();
        let oldCenterPoint = this.props.crs.coordinateToPoint(oldCenter, this.zoom());
        let newCenterPoint = this.props.crs.wrapPoint(VectorUtil.add(oldCenterPoint, pixelAmount), this.zoom());
        let newCenter = this.props.crs.pointToCoordinate(newCenterPoint, this.zoom());
        this.setState({
            dLatitude: this.state.dLatitude + newCenter.latitude - oldCenter.latitude,
            dLongitude: this.state.dLongitude + newCenter.longitude - oldCenter.longitude
        }, callback);
    }

    setPositionTo(coordinate, callback) {
        let oldCenter = this.center();
        this.setState({
            dLatitude: this.state.dLatitude + coordinate.latitude - oldCenter.latitude,
            dLongitude: this.state.dLongitude + coordinate.longitude - oldCenter.longitude
        }, callback);
    }

    setZoomTo(zoom, callback) {
        this.setState({
            dZoom: this.state.dZoom + zoom - this.zoom()
        }, callback);
    }

    setZoomAround(containerPoint, zoom, callback, additionalOffset = VectorUtil.ZERO) {
        let halfSize = this.halfSize();
        let scale = this.scale();
        let deltaScale = this.props.crs.scale(zoom) / this.props.crs.scale(this.zoom());
        let offset = {
            x: (containerPoint.x - halfSize.width * scale) * (1 - 1 / deltaScale),
            y: (containerPoint.y - halfSize.height * scale) * (1 - 1 / deltaScale)
        };
        if (!!callback) {
            let moveMapByCallback = false;
            let setZoomToCallback = false;

            function checkAndCallback() {
                if (moveMapByCallback && setZoomToCallback) {
                    callback();
                }
            }

            this.moveMapBy(VectorUtil.add(offset, additionalOffset), () => {
                moveMapByCallback = true;
                checkAndCallback();
            });
            this.setZoomTo(zoom, () => {
                setZoomToCallback = true;
                checkAndCallback();
            });
        } else {
            this.moveMapBy(VectorUtil.add(offset, additionalOffset));
            this.setZoomTo(zoom);
        }
    }

    setZoomAt(containerPoint, zoom, callback) {
        let halfSize = this.halfSize();
        let scale = this.scale();
        let offset = {
            x: (containerPoint.x - halfSize.width * scale),
            y: (containerPoint.y - halfSize.height * scale)
        };
        if (!!callback) {
            let moveMapByCallback = false;
            let setZoomToCallback = false;

            function checkAndCallback() {
                if (moveMapByCallback && setZoomToCallback) {
                    callback();
                }
            }

            this.moveMapBy(offset, () => {
                moveMapByCallback = true;
                checkAndCallback();
            });
            this.setZoomTo(zoom, () => {
                setZoomToCallback = true;
                checkAndCallback();
            });
        } else {
            this.moveMapBy(offset);
            this.setZoomTo(zoom);
        }
    }

    render() {
        let {width, height, center, zoom, minZoom, maxZoom, crs, onViewChange, onLocationSelect, contextMenuTime, pinchZoomJumpThreshold, children, style, ...other} = this.props;
        let rootStyle = objectAssign({}, {position: 'absolute'}, style);
        let layers = React.Children.toArray(this.props.children);
        let htmlLayers = this.transformHtmlLayers(layers.filter(child => child.type == HtmlLayer || child.type == HtmlPopup));

        return <div style={rootStyle} {...other}>
            <Canvas ref="canvas" width={width} height={height} style={{position: 'absolute'}}>
                Your browser does not support the HTML5 canvas tag.
            </Canvas>
            {htmlLayers}
        </div>;
    }
};
