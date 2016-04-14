import {AppBar, IconMenu, Layout, MenuDivider, MenuItem, Panel} from 'react-toolbox';
import MapHelper from '../lib/MapHelper.js';
import MapView from './MapView.jsx';
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
        }
    };

    handleTouchStart(event) {
        if (event.touches.length == 1) {
            event.button = 0;
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            this.handleMouseDown(event);
        } else if (event.touches.length == 2) {
            this.setState({
                pinchData: {
                    pinching: true,
                    startX: this.state.x,
                    startY: this.state.y,
                    startFirstPinchX: event.touches[0].clientX,
                    startFirstPinchY: event.touches[0].clientY,
                    startSecondPinchX: event.touches[1].clientX,
                    startSecondPinchY: event.touches[1].clientY
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
            // TODO: pin the two pinches to the map and zoom in/out to match the pinch movements
        }
    }

    handleTouchEnd(event) {
        this.handleMouseUp(event);
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
        let mapHelper = new MapHelper();
        let container = this.refs.container;
        let containerOffsetX = container.offsetLeft;
        let containerOffsetY = container.offsetTop;
        let parent = container.offsetParent;
        while (parent != null) {
            containerOffsetX += parent.offsetLeft;
            containerOffsetY += parent.offsetTop;
            parent = parent.offsetParent;
        }
        let alongX = MathUtil.norm(containerOffsetX, containerOffsetX + container.offsetWidth, event.clientX);
        let alongY = MathUtil.norm(containerOffsetY, containerOffsetY + container.offsetHeight, event.clientY);

        if (event.deltaY < 0 && this.state.zoom < mapHelper.maxZoom) {
            this.setState({
                zoom: this.state.zoom + 1,
                x: this.state.x * 2 + container.offsetWidth * alongX,
                y: this.state.y * 2 + container.offsetHeight * alongY
            });
        }
        if (event.deltaY > 0 && this.state.zoom > mapHelper.minZoom) {
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
            <div onWheel={this.handleWheel}
                 onTouchStart={this.handleTouchStart}
                 onTouchMove={this.handleTouchMove}
                 onTouchEnd={this.handleTouchEnd}
                 onMouseDown={this.handleMouseDown}
                 onMouseMove={this.handleMouseMove}
                 onMouseUp={this.handleMouseUp}
                 ref="container">
                <MapView x={this.state.x} y={this.state.y} zoom={Math.floor(this.state.zoom)}/>
            </div>
            <AppBar className={style['top-bar']}>
                <IconMenu icon='menu' position='top-left'>
                    <MenuItem caption='+' onClick={() => this.setState({zoom: this.state.zoom + 0.25})}/>
                    <MenuItem caption='-' onClick={() => this.setState({zoom: this.state.zoom - 0.25})}/>
                    <MenuDivider />
                    <MenuItem value='help' caption='Favorite'/>
                </IconMenu>
                <SearchBar onSubmit={this.handleSearchSubmit}/>
            </AppBar>
            <pre style={{position:'absolute', top:'8rem'}}>
                {JSON.stringify(this.state.pinchData, null, 2)}
            </pre>
        </span>;
    }
};
