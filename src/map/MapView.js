import MapHelper from './MapHelper';
import MapLayer from './MapLayer';
import MapTilesLayer from './MapTilesLayer';
import React from 'react';
import {Canvas, Composition, Picture, Rectangle, Scale, Translate} from './canvas';
import VectorUtil from '../VectorUtil';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    static propTypes = {
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
        zoomLevel: React.PropTypes.number.isRequired,
        scale: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        scale: 1
    };

    state = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.x != nextProps.x
            || this.props.y != nextProps.y
            || this.props.zoomLevel != nextProps.zoomLevel
            || this.props.scale != nextProps.scale
            || this.props.children != nextProps.children
            || this.state.width != nextState.width
            || this.state.height != nextState.height;
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    //transformCanvasLayer(layer) {
    //    let center = MapHelper.project(layer.props, this.props.zoomLevel);
    //    let offset = VectorUtil.add(VectorUtil.subtract(center, this.props), {
    //        x: this.state.width / 2 / this.props.scale,
    //        y: this.state.height / 2 / this.props.scale
    //    });
    //    return <Translate {...offset}>
    //        <Scale scaleWidth={1 / this.props.scale} scaleHeight={1 / this.props.scale}>
    //            {layer.props.children}
    //        </Scale>
    //    </Translate>;
    //}

    //transformHtmlLayer(layer) {
    //    let center = MapHelper.project(layer.props, this.props.zoomLevel);
    //    let offset = VectorUtil.add(VectorUtil.subtract(center, this.props), {
    //        x: this.state.width / 2 / this.props.scale,
    //        y: this.state.height / 2 / this.props.scale
    //    });
    //    return <div style={{position: 'absolute', top: offset.y, left: offset.x}}>
    //        {layer.props.children}
    //    </div>;
    //}

    render() {
        return <span>
            <Canvas ref="canvas" width={this.state.width} height={this.state.height}>
                <Composition type="destination-over">
                    <MapTilesLayer width={this.state.width} height={this.state.height} x={this.props.x} y={this.props.y} zoomLevel={this.props.zoomLevel} scale={this.props.scale}/>
                </Composition>
                <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
            </Canvas>
        </span>;
    }
};
