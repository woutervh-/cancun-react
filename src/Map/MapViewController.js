import MapHelper from './MapHelper';
import VectorUtil from '../VectorUtil';
import React from 'react';
import style from './style';
import Hammer from 'hammerjs';
import classNames from 'classnames';
import EventUtil from '../EventUtil';

export default class MapViewController extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handlePanStart = this.handlePanStart.bind(this);
        this.handlePan = this.handlePan.bind(this);
        this.handlePanEnd = this.handlePanEnd.bind(this);
        this.handlePinchStart = this.handlePinchStart.bind(this);
        this.handlePinch = this.handlePinch.bind(this);
        this.handlePinchEnd = this.handlePinchEnd.bind(this);
        this.handleTwoFingerTap = this.handleTwoFingerTap.bind(this);
        this.handleDoubleTap = this.handleDoubleTap.bind(this);
        this.handlePress = this.handlePress.bind(this);
        this.handleTap = this.handleTap.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    static propTypes = {
        view: React.PropTypes.shape({
            /* Pixel-space coordinate to center map on */
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired,
            /* Zoom */
            zoom: React.PropTypes.number.isRequired
        }).isRequired,
        onViewChange: React.PropTypes.func.isRequired,
        onLongViewChange: React.PropTypes.func.isRequired,
        onLocationSelect: React.PropTypes.func.isRequired,
        onTap: React.PropTypes.func.isRequired,
        pinchZoomJumpThreshold: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        view: {
            x: 0,
            y: 0,
            zoom: 0
        },
        onLocationSelect: () => {
        },
        onTap: () => {
        },
        pinchZoomJumpThreshold: 0.2
    };

    state = {
        dragging: false,
        pinching: false
    };

    componentDidMount() {
        this.hammer = new Hammer(this.refs.container);
        let twoFingerTap = new Hammer.Tap({event: 'twofingertap', pointers: 2});
        this.hammer.add(twoFingerTap);
        this.updateHammer(this.hammer);
    }

    componentDidUpdate() {
        if (this.hammer) {
            /* Not necessary when no bound methods are dependent on props/state */
            //this.updateHammer(this.hammer);
        }
    }

    componentWillUnmount() {
        if (this.hammer) {
            this.hammer.stop();
            this.hammer.destroy();
        }
        this.hammer = null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.view != nextProps.view
            || this.props.onViewChange != nextProps.onViewChange
            || this.props.onLongViewChange != nextProps.onLongViewChange
            || this.props.onLocationSelect != nextProps.onLocationSelect
            || this.props.onTap != nextProps.onTap
            || this.props.pinchZoomJumpThreshold != nextProps.pinchZoomJumpThreshold
            || this.props.children != nextProps.children
            || this.state.dragging != nextState.dragging
            || this.state.pinching != nextState.pinching;
    }

    updateHammer(hammer) {
        hammer.off('panstart');
        hammer.on('panstart', this.handlePanStart);
        hammer.off('pan');
        hammer.on('pan', this.handlePan);
        hammer.off('panend');
        hammer.on('panend', this.handlePanEnd);

        hammer.off('pinchstart');
        hammer.on('pinchstart', this.handlePinchStart);
        hammer.off('pinch');
        hammer.on('pinch', this.handlePinch);
        hammer.off('pinchend');
        hammer.on('pinchend', this.handlePinchEnd);

        hammer.off('twofingertap');
        hammer.on('twofingertap', this.handleTwoFingerTap);
        hammer.off('doubletap');
        hammer.on('doubletap', this.handleDoubleTap);
        hammer.off('press');
        hammer.on('press', this.handlePress);
        hammer.off('tap');
        hammer.on('tap', this.handleTap);

        hammer.get('pinch').set({enable: true, threshold: 0.1});
    }

    /**
     * Converts a position in screen coordinates to a position in container coordinates.
     * @param pointer
     * @param container
     * @returns {{x, y}|*}
     */
    screenToContainer(pointer, container = this.refs.container) {
        let containerOffset = {x: container.offsetLeft, y: container.offsetTop};
        let parent = container.offsetParent;
        while (parent != null) {
            containerOffset.x += parent.offsetLeft;
            containerOffset.y += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return VectorUtil.subtract(pointer, containerOffset);
    }

    /**
     * Converts a position in container coordinates to a position in map coordinates.
     * @param containerPosition
     * @param mapCenter
     * @param container
     * @returns {{x, y}|*}
     */
    containerToMap(containerPosition, mapCenter = this.props.view, container = this.refs.container) {
        let dimensions = {x: container.offsetWidth, y: container.offsetHeight};
        return VectorUtil.add(mapCenter, VectorUtil.subtract(containerPosition, VectorUtil.divide(dimensions, 2)));
    }

    /**
     * Calculates the coordinates of the center of the map in zoom toZoom, that correspond to the given map coordinates at zoom fromZoom.
     * @param x
     * @param y
     * @param fromZoom
     * @param toZoom
     * @returns {{x, y}|*}
     */
    positionAtZoom({x = 0, y = 0} = {}, fromZoom = this.props.view.zoom, toZoom = this.props.view.zoom) {
        let zoomLevelDifference = Math.floor(toZoom) - Math.floor(fromZoom);
        return VectorUtil.multiply({x, y}, Math.pow(2, zoomLevelDifference));
    }

    startDragging(pointer, startView = this.props.view) {
        this.setState({
            dragging: true,
            startView: {
                x: startView.x,
                y: startView.y,
                zoom: startView.zoom
            },
            startPointer: {
                x: pointer.x,
                y: pointer.y
            }
        });
    }

    updateDragging(pointer) {
        let difference = VectorUtil.subtract(pointer, this.state.startPointer);
        let center = VectorUtil.subtract(this.state.startView, difference);
        this.centerOn(center);
    }

    stopDragging() {
        this.centerOn({x: this.props.view.x, y: this.props.view.y}, this.props.view.zoom, true);
        this.setState({
            dragging: false
        });
    }

    startPinching(pointers) {
        this.setState({
            pinching: true,
            startView: {
                x: this.props.view.x,
                y: this.props.view.y,
                zoom: this.props.view.zoom
            },
            startPointer: VectorUtil.divide(VectorUtil.add(pointers[0], pointers[1]), 2),
            endPointer: VectorUtil.divide(VectorUtil.add(pointers[0], pointers[1]), 2),
            startDistance: VectorUtil.distance(pointers[0], pointers[1])
        });
    }

    updatePinching(pointers) {
        let center = VectorUtil.divide(VectorUtil.add(pointers[0], pointers[1]), 2);
        let distance = VectorUtil.distance(pointers[0], pointers[1]);
        let deltaCenter = VectorUtil.subtract(center, this.state.startPointer);
        let oldZoom = this.state.startView.zoom;
        let newZoom = Math.min(MapHelper.maxZoomLevel, Math.max(MapHelper.minZoomLevel, oldZoom + Math.log2(distance / this.state.startDistance)));
        let scale = Math.pow(2, newZoom - oldZoom);
        let newCenter = VectorUtil.subtract(VectorUtil.lerp(this.state.startView, center, (scale - 1) / scale), deltaCenter);
        this.setState({endPointer: center});
        this.centerOn(this.positionAtZoom(newCenter, oldZoom, newZoom), newZoom);
    }

    stopPinching(callback) {
        let startZoom = this.state.startView.zoom;
        let newZoom = this.props.view.zoom;
        let center = this.state.endPointer;
        if (startZoom < newZoom) {
            newZoom = newZoom - startZoom > this.props.pinchZoomJumpThreshold ? Math.ceil(newZoom) : Math.floor(newZoom);
            newZoom = Math.min(MapHelper.maxZoomLevel, newZoom);
        } else if (startZoom > newZoom) {
            newZoom = startZoom - newZoom > this.props.pinchZoomJumpThreshold ? Math.floor(newZoom) : Math.ceil(newZoom);
            newZoom = Math.max(MapHelper.minZoomLevel, newZoom);
        }
        let scale = Math.pow(2, newZoom - startZoom);
        let deltaCenter = VectorUtil.subtract(center, this.state.startPointer);
        let newCenter = VectorUtil.subtract(VectorUtil.lerp(this.state.startView, center, (scale - 1) / scale), deltaCenter);
        let newCenterZoomed = this.positionAtZoom(newCenter, startZoom, newZoom);
        this.centerOn(newCenterZoomed, newZoom, true);
        this.setState({
            pinching: false
        });
        if (!!callback) {
            callback({x: newCenterZoomed.x, y: newCenterZoomed.y, zoom: newZoom});
        }
    }

    centerOn({x = 0, y = 0} = {}, zoom = this.props.view.zoom, sendLongViewChange = false) {
        if (sendLongViewChange) {
            this.props.onLongViewChange({x, y, zoom});
        } else {
            this.props.onViewChange({x, y, zoom});
        }
    }

    handleWheel(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            return;
        }

        let pointer = this.screenToContainer({x: event.clientX, y: event.clientY});
        let center = this.containerToMap(pointer);
        let oldZoom = this.props.view.zoom;
        if (event.deltaY < 0 && this.props.view.zoom < MapHelper.maxZoomLevel) {
            let newZoom = this.props.view.zoom + 1;
            this.centerOn(VectorUtil.lerp(this.positionAtZoom(this.props.view, oldZoom, newZoom), this.positionAtZoom(center, oldZoom, newZoom), 0.5), newZoom, true);
        } else if (event.deltaY > 0 && this.props.view.zoom > MapHelper.minZoomLevel) {
            let newZoom = this.props.view.zoom - 1;
            this.centerOn(VectorUtil.lerp(this.positionAtZoom(this.props.view, oldZoom, newZoom), this.positionAtZoom(center, oldZoom, newZoom), -1), newZoom, true);
        }
    }

    handleContextMenu(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            return;
        }

        event.preventDefault();
        let pointer = this.screenToContainer({x: event.clientX, y: event.clientY});
        let center = this.containerToMap(pointer);
        this.props.onLocationSelect(MapHelper.unproject(center, this.props.view.zoom), true);
    }

    handlePanStart(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            return;
        }

        if (!this.state.dragging && !this.state.pinching) {
            this.startDragging({x: event.pointers[0].clientX, y: event.pointers[0].clientY});
        }
    }

    handlePan(event) {
        if (this.state.dragging) {
            this.updateDragging({x: event.pointers[0].clientX, y: event.pointers[0].clientY});
        }
    }

    handlePanEnd() {
        if (this.state.dragging) {
            this.stopDragging();
        }
    }

    handlePinchStart(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            return;
        }

        if (this.state.dragging) {
            this.stopDragging();
        }
        let p1 = {x: event.pointers[0].clientX, y: event.pointers[0].clientY};
        let p2 = {x: event.pointers[1].clientX, y: event.pointers[1].clientY};
        this.startPinching([p1, p2].map(p => this.containerToMap(this.screenToContainer(p))));
    }

    handlePinch(event) {
        if (this.state.pinching) {
            let p1 = {x: event.pointers[0].clientX, y: event.pointers[0].clientY};
            let p2 = {x: event.pointers[1].clientX, y: event.pointers[1].clientY};
            this.updatePinching([p1, p2].map(p => this.containerToMap(this.screenToContainer(p), this.state.startView)));
        }
    }

    handlePinchEnd() {
        if (this.state.pinching) {
            this.stopPinching();
        }
    }

    handleTwoFingerTap(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            return;
        }

        let p1 = {x: event.pointers[0].clientX, y: event.pointers[0].clientY};
        let p2 = {x: event.pointers[1].clientX, y: event.pointers[1].clientY};
        let center = VectorUtil.divide(VectorUtil.add(...([p1, p2].map(p => this.containerToMap(this.screenToContainer(p))))), 2);
        let oldZoom = this.props.view.zoom;
        if (this.props.view.zoom > MapHelper.minZoomLevel) {
            let newZoom = this.props.view.zoom - 1;
            this.centerOn(VectorUtil.lerp(this.positionAtZoom(this.props.view, oldZoom, newZoom), this.positionAtZoom(center, oldZoom, newZoom), -1), newZoom, true);
        }
    }

    handleDoubleTap(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            return;
        }

        let pointer = this.screenToContainer({x: event.pointers[0].clientX, y: event.pointers[0].clientY});
        let center = this.containerToMap(pointer);
        let oldZoom = this.props.view.zoom;
        if (this.props.view.zoom < MapHelper.maxZoomLevel) {
            let newZoom = this.props.view.zoom + 1;
            this.centerOn(VectorUtil.lerp(this.positionAtZoom(this.props.view, oldZoom, newZoom), this.positionAtZoom(center, oldZoom, newZoom), 0.5), newZoom, true);
        }
    }

    handlePress(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            return;
        }

        let pointer = this.screenToContainer({x: event.pointers[0].clientX, y: event.pointers[0].clientY});
        let center = this.containerToMap(pointer);
        this.props.onLocationSelect(MapHelper.unproject(center, this.props.view.zoom));
    }

    handleTap(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            return;
        }

        this.props.onTap(event);
    }

    handleMouseDown() {
        document.body.classList.add(style['unselectable']);
    }

    handleMouseUp() {
        document.body.classList.remove(style['unselectable']);
    }

    render() {
        return <div ref="container"
                    onWheel={this.handleWheel}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    onContextMenu={this.handleContextMenu}
                    className={classNames({[style['dragging']]: this.state.dragging})}>
            {this.props.children}
        </div>;
    }
};
