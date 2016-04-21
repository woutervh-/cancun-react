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
            startDistance: VectorUtil.distance(pointers[0], pointers[1])
        });
    }

    stopPinching() {
        this.setState({
            pinching: false
        });
    }

    centerOn({x = 0, y = 0} = {}, zoom = this.state.view.zoom) {
        this.setState({
            view: {x, y, zoom}
        });
    }

    positionAtZoom({x = 0, y = 0} = {}, fromZoom = this.state.view.zoom, toZoom = this.state.view.zoom) {
        let zoomLevelDifference = Math.floor(toZoom) - Math.floor(fromZoom);
        return VectorUtil.multiply({x, y}, Math.pow(2, zoomLevelDifference));
    }

    handleTouchStart(event) {
        if (event.touches.length == 1) {
            this.startDragging({x: event.touches[0].clientX, y: event.touches[0].clientY});
        } else if (event.touches.length == 2) {
            if (this.state.dragging) {
                this.stopDragging();
            }
            let p1 = {x: event.touches[0].clientX, y: event.touches[0].clientY};
            let p2 = {x: event.touches[1].clientX, y: event.touches[1].clientY};
            this.startPinching([p1, p2].map(p => this.screenToContainer(p)));
        }
    }

    handleTouchMove(event) {
        if (event.touches.length == 1) {
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            this.handleMouseMove(event);
        } else if (event.touches.length == 2) {
            if (this.state.pinchData.pinching) {
                let container = this.refs.container;
                let containerOffset = {x: container.offsetLeft, y: container.offsetTop};
                let parent = container.offsetParent;
                while (parent != null) {
                    containerOffset.x += parent.offsetLeft;
                    containerOffset.y += parent.offsetTop;
                    parent = parent.offsetParent;
                }
                let p1 = {
                    x: event.touches[0].clientX - containerOffset.x,
                    y: event.touches[0].clientY - containerOffset.y
                };
                let p2 = {
                    x: event.touches[1].clientX - containerOffset.x,
                    y: event.touches[1].clientY - containerOffset.y
                };
                let center = VectorUtil.divide(VectorUtil.add(p1, p2), 2);
                let distance = VectorUtil.distance(p1, p2);
                let scale = distance / this.state.pinchData.startPinch.distance;
                let newZoom = Math.min(MapHelper.maxZoom, Math.max(MapHelper.minZoom, this.state.pinchData.startZoom + Math.log2(scale)));
                let zoomLevelDifference = Math.floor(newZoom) - Math.floor(this.state.pinchData.startZoom);
                let delta = VectorUtil.subtract(center, this.state.pinchData.startContainer.center);
                let deltaPinch = VectorUtil.subtract(center, this.state.pinchData.startPinch.center);
                this.setState({
                    pinch: {center},
                    zoom: newZoom,
                    x: (this.state.pinchData.startPosition.x + (scale - 1) / scale * delta.x - deltaPinch.x) * Math.pow(2, zoomLevelDifference),
                    y: (this.state.pinchData.startPosition.y + (scale - 1) / scale * delta.y - deltaPinch.y) * Math.pow(2, zoomLevelDifference)
                });
            }
        }
    }

    handleTouchEnd(event) {
        if (event.touches.length == 0) {
            this.stopDragging();
        } else if (event.touches.length == 1) {
            if (this.state.pinching) {

            }
            let startZoom = this.state.pinchData.startZoom;
            let newZoom = this.state.zoom;
            if (startZoom < newZoom) {
                newZoom = Math.ceil(newZoom);
            } else if (startZoom > newZoom) {
                newZoom = Math.floor(newZoom);
            }
            let zoomLevelDifference = Math.floor(newZoom) - Math.floor(startZoom);
            let delta = VectorUtil.subtract(this.state.pinch.center, this.state.pinchData.startContainer.center);
            let deltaPinch = VectorUtil.subtract(this.state.pinch.center, this.state.pinchData.startPinch.center);
            this.setState({
                zoom: newZoom,
                x: (this.state.pinchData.startPosition.x + delta.x - deltaPinch.x) * Math.pow(2, zoomLevelDifference),
                y: (this.state.pinchData.startPosition.y + delta.y - deltaPinch.y) * Math.pow(2, zoomLevelDifference),
                pinchData: {pinching: false},
                debug: {
                    delta, zoomLevelDifference
                }
            }, () => this.handleTouchStart(event));
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
            <pre style={{position: 'absolute', top: '1em', left: 0}}>
                {JSON.stringify(this.state.debug, null, 2)}
            </pre>
        </div>;
    }
};
