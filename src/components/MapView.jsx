import Map from '../lib/Map.js';
import React from 'react';
import Resizable from 'react-component-resizable';

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
    }

    handleClick(event) {
    }

    handleWheel(event) {
        let map = this.refs.map;
        let relativeX = event.pageX - map.offsetLeft;
        let relativeY = event.pageY - map.offsetTop;

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
        return <Resizable onResize={this.handleResize} style={{width: '100%', height: '100%'}}>
            <ReactCanvas.Surface top={0} left={0} width={this.state.width} height={this.state.height}>
                <ReactCanvas.Image src={'http://crossorigin.me/' + this.props.map.getTileUrl(this.state.zoom, this.state.x, this.state.y)} style={{top: 0, left: 0, width: 256, height: 256}}/>
                <ReactCanvas.Image src={'http://crossorigin.me/' + this.props.map.getTileUrl(this.state.zoom, this.state.x + 1, this.state.y)} style={{top: 0, left: 256, width: 256, height: 256}}/>
                <ReactCanvas.Image src={'http://crossorigin.me/' + this.props.map.getTileUrl(this.state.zoom, this.state.x, this.state.y + 1)} style={{top: 256, left: 0, width: 256, height: 256}}/>
                <ReactCanvas.Image src={'http://crossorigin.me/' + this.props.map.getTileUrl(this.state.zoom, this.state.x + 1, this.state.y + 1)} style={{top: 256, left: 256, width: 256, height: 256}}/>
            </ReactCanvas.Surface>
        </Resizable>;
    }
};
