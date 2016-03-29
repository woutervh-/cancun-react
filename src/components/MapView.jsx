import Canvas from './canvas/Canvas.jsx';
import Map from '../lib/Map.js';
import Picture from './canvas/Picture.jsx';
import React from 'react';
import Rectangle from './canvas/Rectangle.jsx';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.handleResize = this.handleResize.bind(this);
        //this.handleDrag = this.handleDrag.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
    }

    static propTypes = {
        map: React.PropTypes.instanceOf(Map).isRequired
    };

    state = {
        zoom: 0,
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight
    };

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        // TODO: proper drag handling
        document.addEventListener('dragstart', this.handleDragStart);
        document.addEventListener('dragover', this.handleDragOver);
        document.addEventListener('dragend', this.handleDragEnd);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    handleDragStart(event) {
        console.log(event.clientX);
    }

    handleDragOver(event) {
        console.log(event.clientX);
        event.preventDefault();
    }

    handleDragEnd(event) {
        console.log(event.clientX);
        event.preventDefault();
    }

    handleWheel(event) {
        let canvas = this.refs.canvas;
        let relativeX = event.pageX - canvas.offsetLeft;
        let relativeY = event.pageY - canvas.offsetTop;

        // TODO: zoom relative to center of viewport

        if (event.deltaY < 0 && this.state.zoom < this.props.map.maxZoom) {
            this.setState({zoom: this.state.zoom + 1});
        }
        if (event.deltaY > 0 && this.state.zoom > this.props.map.minZoom) {
            this.setState({zoom: this.state.zoom - 1});
        }

        event.preventDefault();
    }

    render() {
        let numTilesX = Math.ceil(this.state.width / this.props.map.tileWidth);
        let numTilesY = Math.ceil(this.state.height / this.props.map.tileHeight);
        let tiles = [];
        for (let i = 0; i < numTilesX; i++) {
            for (let j = 0; j < numTilesY; j++) {
                tiles.push({
                    url: 'http://crossorigin.me/' + this.props.map.getTileUrl(this.state.zoom, this.state.x + i, this.state.y + j),
                    left: i * 256,
                    top: j * 256,
                    width: this.props.map.tileWidth,
                    height: this.props.map.tileHeight
                });
            }
        }

        return <div onWheel={this.handleWheel}>
            <Canvas draggable={true} ref="canvas" width={this.state.width} height={this.state.height}>
                {tiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height}/>)}
                <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
            </Canvas>
        </div>;
    }
};
