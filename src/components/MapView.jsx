import Canvas from './canvas/Canvas.jsx';
import Map from '../lib/Map.js';
import Picture from './canvas/Picture.jsx';
import React from 'react';
import Rectangle from './canvas/Rectangle.jsx';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.handleResize = this.handleResize.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        // this.componentDidMount = this.componentDidMount.bind(this);
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
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
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
        return <Canvas width={this.state.width} height={this.state.height}>
            <Rectangle width={200} height={300} fillStyle="white"/>
            <Picture source="images/swirl.svg" width={100} height={100}/>ight={100}/>
        </Canvas>;

        return <div>
            <Image src={'http://crossorigin.me/' + this.props.map.getTileUrl(this.state.zoom, this.state.x, this.state.y)} style={{top: 0, left: 0, width: 256, height: 256}}/>
            <Image src={'http://crossorigin.me/' + this.props.map.getTileUrl(this.state.zoom, this.state.x + 1, this.state.y)} style={{top: 0, left: 256, width: 256, height: 256}}/>
            <Image src={'http://crossorigin.me/' + this.props.map.getTileUrl(this.state.zoom, this.state.x, this.state.y + 1)} style={{top: 256, left: 0, width: 256, height: 256}}/>
            <Image src={'http://crossorigin.me/' + this.props.map.getTileUrl(this.state.zoom, this.state.x + 1, this.state.y + 1)} style={{top: 256, left: 256, width: 256, height: 256}}/>
        </div>;
    }
};
