import React from 'react';
import Resizable from 'react-component-resizable';
import Map from '../lib/Map.js';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.handleResize = this.handleResize.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    static propTypes = {
        map: React.PropTypes.instanceOf(Map).isRequired
    };

    state = {
        zoom: 0,
        x: 0,
        y: 0,
        width: 0
    };

    handleResize(event) {
        this.setState({width: event.width});
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

    render() {
        return <Resizable onResize={this.handleResize}>{this.state.width} x {this.state.height}</Resizable>;

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
