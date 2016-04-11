import Canvas from './canvas/Canvas.jsx';
import MapHelper from '../lib/MapHelper.js';
import MathUtil from '../lib/MathUtil.js';
import Picture from './canvas/Picture.jsx';
import React from 'react';
import Rectangle from './canvas/Rectangle.jsx';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    state = {
        zoom: 0,
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        dragData: {
            dragging: false
        }
    };

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleTouchStart(event) {
        event.button = 0;
        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        this.handleMouseDown(event);
    }

    handleTouchMove(event) {
        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        this.handleMouseMove(event);
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
            event.preventDefault();
        }
    }

    handleMouseMove(event) {
        if (this.state.dragData.dragging) {
            let dx = event.clientX - this.state.dragData.startMouseX;
            let dy = event.clientY - this.state.dragData.startMouseY;
            this.setState({x: this.state.dragData.startX - dx, y: this.state.dragData.startY - dy});
        }
        event.preventDefault();
    }

    handleMouseUp(event) {
        this.setState({dragData: {dragging: false}});
        event.preventDefault();
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
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

        event.preventDefault();
    }

    render() {
        let mapHelper = new MapHelper();
        let startTile = {
            x: Math.floor(this.state.x / mapHelper.tileWidth),
            y: Math.floor(this.state.y / mapHelper.tileHeight)
        };
        let endTile = {
            x: Math.ceil((this.state.x + this.state.width) / mapHelper.tileWidth),
            y: Math.ceil((this.state.y + this.state.height) / mapHelper.tileHeight)
        };
        let offset = {
            x: startTile.x * mapHelper.tileWidth - this.state.x,
            y: startTile.y * mapHelper.tileHeight - this.state.y
        };
        let tiles = [];
        for (let i = 0; i < endTile.x - startTile.x; i++) {
            for (let j = 0; j < endTile.y - startTile.y; j++) {
                tiles.push({
                    url: mapHelper.getTileUrl(this.state.zoom, startTile.x + i, startTile.y + j),
                    left: mapHelper.tileWidth * i + offset.x,
                    top: mapHelper.tileHeight * j + offset.y,
                    width: mapHelper.tileWidth,
                    height: mapHelper.tileHeight
                });
            }
        }
        tiles.sort((a, b) => {
            let adx = a.left + mapHelper.tileWidth / 2 - this.state.width / 2;
            let ady = a.top + mapHelper.tileHeight / 2 - this.state.height / 2;
            let bdx = b.left + mapHelper.tileWidth / 2 - this.state.width / 2;
            let bdy = b.top + mapHelper.tileHeight / 2 - this.state.height / 2;
            let adr = adx * adx + ady * ady;
            let bdr = bdx * bdx + bdy * bdy;
            return adr - bdr;
        });

        return <div style={{width: '100%', height: '100%'}}
                    onWheel={this.handleWheel}
                    onTouchStart={this.handleTouchStart}
                    onTouchMove={this.handleTouchMove}
                    onTouchEnd={this.handleTouchEnd}
                    onMouseDown={this.handleMouseDown}
                    onMouseMove={this.handleMouseMove}
                    onMouseUp={this.handleMouseUp}
                    ref="container">
            <Canvas ref="canvas" width={this.state.width} height={this.state.height}>
                {tiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height}/>)}
                <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
            </Canvas>
        </div>;
    }
};
