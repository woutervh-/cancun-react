import React from 'react';
import {Base, EPSG3857} from './Geography/CoordinateReferenceSystems';
import {HtmlLayer, TileLayer} from './Layers';
import objectAssign from 'object-assign';
import ImageFrontier from './ImageFrontier';

export default class Map extends React.Component {
    constructor() {
        super();
        this.imageFrontier = new ImageFrontier();
    }

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        center: React.PropTypes.shape({
            latitude: React.PropTypes.number.isRequired,
            longitude: React.PropTypes.number.isRequired
        }).isRequired,
        zoomLevel: React.PropTypes.number.isRequired,
        coordinateReferenceSystem: React.PropTypes.instanceOf(Base).isRequired
    };

    static defaultProps = {
        center: {latitude: 0, longitude: 0},
        zoomLevel: 0,
        coordinateReferenceSystem: new EPSG3857()
    };

    state = {
        dx: 0,
        dy: 0
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.width != nextProps.width
            || this.props.height != nextProps.height;
    }

    componentDidMount() {
        this.drawTileLayers();
    }

    componentDidUpdate() {
        this.drawTileLayers();
    }

    drawTileLayers() {
        let layers = React.Children.toArray(this.props.children).filter(child => child.type == TileLayer);
        for (let layer of layers) {
            console.log(layer.props)
        }
    }

    render() {
        let {width, height, center, zoomLevel, coordinateReferenceSystem, children, style, ...other} = this.props;
        let rootStyle = objectAssign({}, {position: 'absolute'}, style);

        return <div style={rootStyle} {...other}>
            <canvas ref="canvas" style={{position: 'absolute', width, height}}>
                Your browser does not support the HTML5 canvas tag.
            </canvas>
            <div ref="htmlLayers" style={{position: 'absolute', overflow: 'hidden', top: this.state.dy, left: this.state.dx, width, height}}>
                {React.Children.toArray(children).filter(child => child.type == HtmlLayer)}
            </div>
        </div>;
    }
};
