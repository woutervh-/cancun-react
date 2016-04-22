import MapHelper from '../lib/MapHelper.js';
import MapView from './MapView.jsx';
import MathUtil from '../lib/MathUtil.js';
import VectorUtil from '../lib/VectorUtil.js';
import React from 'react';

export default class MapViewContainer extends React.Component {
    constructor() {
        super();
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    state = {
        view: {
            /* Pixel-space coordinate to center map on */
            x: 0,
            y: 0,
            /* Zoom */
            zoom: 0
        },
        dragging: false,
        pinching: false
    };

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
    containerToMap(containerPosition, mapCenter = this.state.view, container = this.refs.container) {
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
    positionAtZoom({x = 0, y = 0} = {}, fromZoom = this.state.view.zoom, toZoom = this.state.view.zoom) {
        let zoomLevelDifference = Math.floor(toZoom) - Math.floor(fromZoom);
        return VectorUtil.multiply({x, y}, Math.pow(2, zoomLevelDifference));
    }

    startDragging(pointer) {
        this.setState({
            dragging: true,
            startView: {
                x: this.state.view.x,
                y: this.state.view.y,
                zoom: this.state.view.zoom
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
        this.setState({
            dragging: false
        });
    }

    startPinching(pointers) {
        this.setState({
            pinching: true,
            startView: {
                x: this.state.view.x,
                y: this.state.view.y,
                zoom: this.state.view.zoom
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
        let scale = distance / this.state.startDistance;
        let oldZoom = this.state.startView.zoom;
        let newZoom = Math.min(MapHelper.maxZoom, Math.max(MapHelper.minZoom, oldZoom + Math.log2(scale)));
        let newCenter = VectorUtil.subtract(VectorUtil.lerp(this.state.startView, center, (scale - 1) / scale), deltaCenter);
        this.setState({endPointer: center});
        this.centerOn(this.positionAtZoom(newCenter, oldZoom, newZoom), newZoom);
    }

    stopPinching() {
        let startZoom = this.state.startView.zoom;
        let newZoom = this.state.view.zoom;
        let center = this.state.endPointer;
        if (startZoom < newZoom) {
            newZoom = Math.ceil(newZoom);
            this.centerOn(VectorUtil.lerp(this.positionAtZoom(this.state.startView, startZoom, newZoom), this.positionAtZoom(center, startZoom, newZoom), 0.5), newZoom);
        } else if (startZoom > newZoom) {
            newZoom = Math.floor(newZoom);
            this.centerOn(VectorUtil.lerp(this.positionAtZoom(this.state.startView, startZoom, newZoom), this.positionAtZoom(center, startZoom, newZoom), -1), newZoom);
        }
        this.setState({
            pinching: false
        });
    }

    centerOn({x = 0, y = 0} = {}, zoom = this.state.view.zoom) {
        this.setState({
            view: {x, y, zoom}
        });
    }

    handleTouchStart(event) {
        if (event.touches.length == 1 && !this.state.dragging && !this.state.pinching) {
            this.startDragging({x: event.touches[0].clientX, y: event.touches[0].clientY});
        } else if (event.touches.length == 2 && !this.state.pinching) {
            if (this.state.dragging) {
                this.stopDragging();
            }
            let p1 = {x: event.touches[0].clientX, y: event.touches[0].clientY};
            let p2 = {x: event.touches[1].clientX, y: event.touches[1].clientY};
            this.startPinching([p1, p2].map(p => this.containerToMap(this.screenToContainer(p))));
        }
    }

    handleTouchMove(event) {
        if (event.touches.length == 1 && this.state.dragging) {
            this.updateDragging({x: event.touches[0].clientX, y: event.touches[0].clientY});
        } else if (event.touches.length == 2 && this.state.pinching) {
            let p1 = {x: event.touches[0].clientX, y: event.touches[0].clientY};
            let p2 = {x: event.touches[1].clientX, y: event.touches[1].clientY};
            this.updatePinching([p1, p2].map(p => this.containerToMap(this.screenToContainer(p), this.state.startView)));
        }
    }

    handleTouchEnd(event) {
        if (event.touches.length == 0 && this.state.dragging) {
            this.stopDragging();
        } else if (event.touches.length == 1 && this.state.pinching) {
            this.stopPinching();
        }
    }

    handleMouseDown(event) {
        if (event.button == 0 && !this.state.dragging && !this.state.pinching) {
            this.startDragging({x: event.clientX, y: event.clientY});
        }
    }

    handleMouseMove(event) {
        if (this.state.dragging) {
            this.updateDragging({x: event.clientX, y: event.clientY});
        }
    }

    handleMouseUp() {
        if (this.state.dragging) {
            this.stopDragging();
        }
    }

    handleWheel(event) {
        let pointer = this.screenToContainer({x: event.clientX, y: event.clientY});
        let center = this.containerToMap(pointer);
        let oldZoom = this.state.view.zoom;
        let newZoom = this.state.view.zoom;
        if (event.deltaY < 0 && this.state.view.zoom < MapHelper.maxZoom) {
            newZoom += 1;
            this.centerOn(VectorUtil.lerp(this.positionAtZoom(this.state.view, oldZoom, newZoom), this.positionAtZoom(center, oldZoom, newZoom), 0.5), newZoom);
        } else if (event.deltaY > 0 && this.state.view.zoom > MapHelper.minZoom) {
            newZoom -= 1;
            this.centerOn(VectorUtil.lerp(this.positionAtZoom(this.state.view, oldZoom, newZoom), this.positionAtZoom(center, oldZoom, newZoom), -1), newZoom);
        }
    }

    render() {
        return <div
            onWheel={this.handleWheel}
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
            ref="container">
            <MapView
                x={this.state.view.x}
                y={this.state.view.y}
                zoom={Math.floor(this.state.view.zoom)}
                scale={1 + this.state.view.zoom - Math.floor(this.state.view.zoom)}/>
        </div>;
    }
};
