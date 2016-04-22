import Canvas from './canvas/Canvas.jsx';
import MapHelper from '../lib/MapHelper.js';
import Picture from './canvas/Picture.jsx';
import React from 'react';
import Rectangle from './canvas/Rectangle.jsx';
import Scale from './canvas/Scale.jsx';
import Transform from './canvas/Transform.jsx';
import Translate from './canvas/Translate.jsx';

export default class MapView extends React.Component {
    constructor() {
        super();
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

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    render() {
        let topLeft = {
            x: this.props.x - this.state.width / 2 / this.props.scale,
            y: this.props.y - this.state.height / 2 / this.props.scale
        };
        let startTile = {
            x: Math.floor(topLeft.x / MapHelper.tileWidth),
            y: Math.floor(topLeft.y / MapHelper.tileHeight)
        };
        let endTile = {
            x: Math.ceil((topLeft.x + this.state.width) / MapHelper.tileWidth),
            y: Math.ceil((topLeft.y + this.state.height) / MapHelper.tileHeight)
        };
        let offset = {
            x: startTile.x * MapHelper.tileWidth - topLeft.x,
            y: startTile.y * MapHelper.tileHeight - topLeft.y
        };
        let tiles = [];
        for (let i = 0; i < endTile.x - startTile.x; i++) {
            for (let j = 0; j < endTile.y - startTile.y; j++) {
                tiles.push({
                    url: MapHelper.getTileUrl(startTile.x + i, startTile.y + j, this.props.zoomLevel),
                    left: MapHelper.tileWidth * i + offset.x,
                    top: MapHelper.tileHeight * j + offset.y,
                    width: MapHelper.tileWidth,
                    height: MapHelper.tileHeight
                });
            }
        }
        tiles.sort((a, b) => {
            let adx = a.left + MapHelper.tileWidth / 2 - this.state.width / 2;
            let ady = a.top + MapHelper.tileHeight / 2 - this.state.height / 2;
            let bdx = b.left + MapHelper.tileWidth / 2 - this.state.width / 2;
            let bdy = b.top + MapHelper.tileHeight / 2 - this.state.height / 2;
            let adr = adx * adx + ady * ady;
            let bdr = bdx * bdx + bdy * bdy;
            return adr - bdr;
        });

        return <Canvas ref="canvas" width={this.state.width} height={this.state.height} tabIndex={0}>
            <Scale scaleWidth={this.props.scale} scaleHeight={this.props.scale}>
                {tiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height}/>)}
            </Scale>
            <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
        </Canvas>;
    }
};
