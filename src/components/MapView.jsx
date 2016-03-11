import React from 'react';
import Resizable from 'react-component-resizable';
import Map from '../lib/Map.js';
import Canvas from './canvas/Canvas.jsx'

export default class MapView extends React.Component {
    constructor() {
        super();
        this.handleResize = this.handleResize.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    static propTypes = {
        map: React.PropTypes.instanceOf(Map).isRequired
    };

    state = {
        zoom: 0,
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    handleResize(event) {
        this.setState({width: event.width, height: event.height});
        console.log(this.state);
    }

    handleClick(event) {
    }

    handleWheel(event) {
        let map = this.refs.map;
        let relativeX = event.pageX - map.offsetLeft;
        let relativeY = event.pageY - map.offsetTop;

        if (event.deltaY < 0 && this.state.zoom < this.props.map.maxZoom) {
            this.setState({zoom: this.state.zoom + 1});
        }
        if (event.deltaY > 0 && this.state.zoom > this.props.map.minZoom) {
            this.setState({zoom: this.state.zoom - 1});
        }

        event.preventDefault();
    }

    componentDidMount() {
        //let canvas = this.refs.canvas;
        //let context = canvas.getContext('2d');
        //context.fillStyle = 'red';
        //context.fillRect(0, 0, 100, 50);
    }

    render() {
        return <Resizable onResize={this.handleResize} style={{width: '100%', height: '100%'}}>
            <Canvas width={this.state.width} height={this.state.height}/>
        </Resizable>;

        return <div ref="map" onClick={this.handleClick} onWheel={this.handleWheel}>
            <div
                style={{float: 'left', content: 'url('+this.props.map.getTileUrl(this.state.zoom, this.state.x, this.state.y)+')'}}>
            </div>
            <div
                style={{float: 'left', content: 'url('+this.props.map.getTileUrl(this.state.zoom, this.state.x + 1, this.state.y)+')'}}>
            </div>
            <div style={{float: 'left', width: '100%'}}></div>

            <div
                style={{float: 'left', content: 'url('+this.props.map.getTileUrl(this.state.zoom, this.state.x, this.state.y + 1)+')'}}>
            </div>
            <div
                style={{float: 'left', content: 'url('+this.props.map.getTileUrl(this.state.zoom, this.state.x + 1, this.state.y + 1)+')'}}>
            </div>
            <div style={{float: 'left', width: '100%'}}></div>
        </div>;
    }
};
