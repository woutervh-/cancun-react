import {AppBar, IconMenu, Layout, MenuDivider, MenuItem, Panel} from 'react-toolbox';
import MapHelper from '../lib/MapHelper.js';
import MapView from './MapView.jsx';
import MapViewContainer from './MapViewContainer.jsx';
import MathUtil from '../lib/MathUtil.js';
import React from 'react';
import SearchBar from './SearchBar.jsx';
import style from './style.scss';

export default class App extends React.Component {
    constructor() {
        super();
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    state = {
        x: 0,
        y: 0,
        zoom: 0,
        dragData: {
            dragging: false
        },
        pinchData: {
            pinching: false
        },
        pinchCenter: {
            x: 0,
            y: 0
        }
    };

    handleTouchStart(event) {
        if (event.touches.length == 1) {
            event.button = 0;
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            this.handleMouseDown(event);
        } else if (event.touches.length == 2) {
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
            let center = MathUtil.divide(MathUtil.add(p1, p2), 2);
            let distance = MathUtil.distance(p1, p2);
            this.setState({
                pinch: {center},
                dragData: {dragging: false},
                pinchData: {
                    pinching: true,
                    startContainer: {
                        center: {
                            x: containerOffset.x + container.offsetWidth / 2,
                            y: containerOffset.y + container.offsetHeight / 2
                        }
                    },
                    startPinch: {center, distance},
                    startZoom: this.state.zoom,
                    startPosition: {
                        x: this.state.x,
                        y: this.state.y
                    }
                }
            });
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
                let center = MathUtil.divide(MathUtil.add(p1, p2), 2);
                let distance = MathUtil.distance(p1, p2);
                let scale = distance / this.state.pinchData.startPinch.distance;
                let newZoom = Math.min(MapHelper.maxZoom, Math.max(MapHelper.minZoom, this.state.pinchData.startZoom + Math.log2(scale)));
                let zoomLevelDifference = Math.floor(newZoom) - Math.floor(this.state.pinchData.startZoom);
                let delta = MathUtil.subtract(center, this.state.pinchData.startContainer.center);
                let deltaPinch = MathUtil.subtract(center, this.state.pinchData.startPinch.center);
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
            this.handleMouseUp();
        } else if (event.touches.length == 1) {
            let startZoom = this.state.pinchData.startZoom;
            let newZoom = this.state.zoom;
            if (startZoom < newZoom) {
                newZoom = Math.ceil(newZoom);
            } else if (startZoom > newZoom) {
                newZoom = Math.floor(newZoom);
            }
            let zoomLevelDifference = Math.floor(newZoom) - Math.floor(startZoom);
            let delta = MathUtil.subtract(this.state.pinch.center, this.state.pinchData.startContainer.center);
            let deltaPinch = MathUtil.subtract(this.state.pinch.center, this.state.pinchData.startPinch.center);
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
        if (event.button == 0) {
            this.setState({
                dragData: {
                    dragging: true,
                    startX: this.state.x,
                    startY: this.state.y,
                    startMouseX: event.clientX,
                    startMouseY: event.clientY
                }
            });
        }
    }

    handleMouseMove(event) {
        if (this.state.dragData.dragging) {
            let dx = event.clientX - this.state.dragData.startMouseX;
            let dy = event.clientY - this.state.dragData.startMouseY;
            this.setState({x: this.state.dragData.startX - dx, y: this.state.dragData.startY - dy});
        }
    }

    handleMouseUp() {
        this.setState({dragData: {dragging: false}});
    }

    handleWheel(event) {
        let container = this.refs.container;
        let containerOffsetX = container.offsetLeft;
        let containerOffsetY = container.offsetTop;
        let parent = container.offsetParent;
        while (parent != null) {
            containerOffsetX += parent.offsetLeft;
            containerOffsetY += parent.offsetTop;
            parent = parent.offsetParent;
        }
        let alongX = MathUtil.lerp(-0.5, 0.5, MathUtil.norm(containerOffsetX, containerOffsetX + container.offsetWidth, event.clientX));
        let alongY = MathUtil.lerp(-0.5, 0.5, MathUtil.norm(containerOffsetY, containerOffsetY + container.offsetHeight, event.clientY));

        if (event.deltaY < 0 && this.state.zoom < MapHelper.maxZoom) {
            this.setState({
                zoom: this.state.zoom + 1,
                x: this.state.x * 2 + container.offsetWidth * alongX,
                y: this.state.y * 2 + container.offsetHeight * alongY
            });
        }
        if (event.deltaY > 0 && this.state.zoom > MapHelper.minZoom) {
            this.setState({
                zoom: this.state.zoom - 1,
                x: (this.state.x - container.offsetWidth * alongX) / 2,
                y: (this.state.y - container.offsetHeight * alongY) / 2
            });
        }
    }

    handleSearchSubmit(input) {
        if (!!input) {
            console.log('submitted:');
            console.log(input);
        }
    }

    render() {
        return <span>
            <MapViewContainer/>
        </span>;

        return <span>
            <div onWheel={this.handleWheel}
                 onTouchStart={this.handleTouchStart}
                 onTouchMove={this.handleTouchMove}
                 onTouchEnd={this.handleTouchEnd}
                 onMouseDown={this.handleMouseDown}
                 onMouseMove={this.handleMouseMove}
                 onMouseUp={this.handleMouseUp}
                 ref="container">
                <MapView x={this.state.x} y={this.state.y} zoom={Math.floor(this.state.zoom)} scale={1 + this.state.zoom - Math.floor(this.state.zoom)}/>
            </div>
        </span>;

        //<AppBar className={style['top-bar']}>
        //    <IconMenu icon='menu' position='top-left'>
        //        <MenuItem caption='+' onClick={() => this.setState({zoom: this.state.zoom + 0.25})}/>
        //        <MenuItem caption='-' onClick={() => this.setState({zoom: this.state.zoom - 0.25})}/>
        //        <MenuDivider />
        //        <MenuItem value='help' caption='Favorite'/>
        //    </IconMenu>
        //    <SearchBar onSubmit={this.handleSearchSubmit}/>
        //</AppBar>
    }
};
