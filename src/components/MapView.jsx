import Map from '../lib/Map.js';
import React from 'react';
import Resizable from 'react-component-resizable';
import {Surface, Image, Text} from 'react-canvas';

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
            <Surface top={0} left={0} width={this.state.width} height={this.state.height}>
                <Image src="http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg" style={{top: 0, left: 0, width: '256', height: '256'}}/>
                <Image src="http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg" style={{top: 0, left: 0, width: '256', height: '256'}}/>
                <Image src="http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg" style={{top: 0, left: 0, width: '256', height: '256'}}/>
                <Image src="http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg" style={{top: 0, left: 0, width: '256', height: '256'}}/>
            </Surface>
        </Resizable>;

        return <Resizable onResize={this.handleResize} style={{width: '100%', height: '100%'}}>
            <Surface top={0} left={0} width={this.state.width} height={this.state.height}>
                <Image src="http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg" style={{top: 0, left: 0, width: '150', height: '150'}}/>
                <Text style={{top: 0, left: 0, width: 100, height: 20, lineHeight: 20, fontSize: 12}}>Hello.</Text>
            </Surface>
        </Resizable>;

        return <Resizable onResize={this.handleResize} style={{width: '100%', height: '100%'}}>
            <Canvas width={this.state.width} height={this.state.height}>
                <Rectangle width={200} height={100} fillStyle="rgba(0, 0, 0, 0)"/>
                <Picture width={100} height={100} source="http://www.html5canvastutorials.com/demos/assets/darth-vader.jpg"/>
            </Canvas>
        </Resizable>;
    }
};
