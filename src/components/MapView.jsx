import Canvas from './canvas/Canvas.jsx';
import classNames from 'classnames';
import Map from '../lib/Map.js';
import Picture from './canvas/Picture.jsx';
import React from 'react';
import Rectangle from './canvas/Rectangle.jsx';
import style from '../../public/stylesheets/style.css';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    static propTypes = {
        map: React.PropTypes.instanceOf(Map).isRequired
    };

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

    handleMouseUp() {
        this.setState({dragData: {dragging: false}});
        event.preventDefault();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    handleWheel(event) {
        let container = this.refs.container;
        let containerOffsetX = container.offsetLeft;
        let containerOffsetY = container.offsetTop;
        let parent = container.offsetParent;
        while (parent != null) {
            containerOffsetX += parent.offsetLeft;
            containerOffsetY += parent.offsetHeight;
            parent = parent.offsetParent;
        }
        let relativeWheelX = event.clientX - containerOffsetX - this.state.width / 2;
        let relativeWheelY = this.state.height / 2 + event.clientY - containerOffsetY;
        let centerX = this.state.x + this.state.width / 2;
        let centerY = this.state.y + this.state.height / 2;

        // Look for behavior: when zoomed in, keep map position at mouse position the same

        this.setState({
            wheelX: relativeWheelX,
            wheelY: relativeWheelY,
            centerX: centerX,
            centerY: centerY
        });

        // TODO: zoom relative to center of viewport

        if (event.deltaY < 0 && this.state.zoom < this.props.map.maxZoom) {
            this.setState({
                //zoom: this.state.zoom + 1,
                x: this.state.x + relativeWheelX / 2,
                y: this.state.y + relativeWheelY / 2
            });
        }
        if (event.deltaY > 0 && this.state.zoom > this.props.map.minZoom) {
            this.setState({
                zoom: this.state.zoom - 1
            });
        }

        event.preventDefault();
    }

    render() {
        let startTileX = Math.floor(this.state.x / this.props.map.tileWidth);
        let startTileY = Math.floor(this.state.y / this.props.map.tileHeight);
        let endTileX = Math.ceil((this.state.x + this.state.width) / this.props.map.tileWidth);
        let endTileY = Math.ceil((this.state.y + this.state.height) / this.props.map.tileHeight);
        let numTilesX = endTileX - startTileX;
        let numTilesY = endTileY - startTileY;
        let offsetX = startTileX * this.props.map.tileWidth - this.state.x;
        let offsetY = startTileY * this.props.map.tileHeight - this.state.y;
        let tiles = [];
        for (let i = 0; i < numTilesX; i++) {
            for (let j = 0; j < numTilesY; j++) {
                tiles.push({
                    url: 'http://crossorigin.me/' + this.props.map.getTileUrl(3, startTileX + i, startTileY + j),
                    left: this.props.map.tileWidth * i + offsetX,
                    top: this.props.map.tileHeight * j + offsetY,
                    width: this.props.map.tileWidth,
                    height: this.props.map.tileHeight
                });
            }
        }

        return <div className={classNames(style['map-container'], {[style['dragging']]: this.state.dragData.dragging})}
                    onWheel={this.handleWheel}
                    onMouseDown={this.handleMouseDown}
                    onMouseMove={this.handleMouseMove}
                    onMouseUp={this.handleMouseUp}
                    ref="container">
            <Canvas ref="canvas" width={this.state.width} height={this.state.height}>
                {tiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height}/>)}
                <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
            </Canvas>
            <pre style={{position:'absolute', left: '1em', top: '3em'}}>
                startTileX: {startTileX}<br/>
                startTileY: {startTileY}<br/>
                endTileX: {endTileX}<br/>
                endTileY: {endTileY}<br/>
                numTilesX: {numTilesX}<br/>
                numTilesY: {numTilesY}<br/>
                offsetX: {offsetX}<br/>
                offsetY: {offsetY}<br/>
                width: {this.state.width}<br/>
                height: {this.state.height}<br/>
                state: {JSON.stringify(this.state, null, 2)}
            </pre>
        </div>;
    }
};
