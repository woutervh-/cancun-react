import Canvas from './canvas/Canvas.jsx';
import MapHelper from '../lib/MapHelper.js';
import Picture from './canvas/Picture.jsx';
import React from 'react';
import Rectangle from './canvas/Rectangle.jsx';

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
        zoom: React.PropTypes.number.isRequired
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
        let mapHelper = new MapHelper();
        let startTile = {
            x: Math.floor(this.props.x / mapHelper.tileWidth),
            y: Math.floor(this.props.y / mapHelper.tileHeight)
        };
        let endTile = {
            x: Math.ceil((this.props.x + this.state.width) / mapHelper.tileWidth),
            y: Math.ceil((this.props.y + this.state.height) / mapHelper.tileHeight)
        };
        let offset = {
            x: startTile.x * mapHelper.tileWidth - this.props.x,
            y: startTile.y * mapHelper.tileHeight - this.props.y
        };
        let tiles = [];
        for (let i = 0; i < endTile.x - startTile.x; i++) {
            for (let j = 0; j < endTile.y - startTile.y; j++) {
                tiles.push({
                    url: mapHelper.getTileUrl(this.props.zoom, startTile.x + i, startTile.y + j),
                    left: mapHelper.tileWidth * i + offset.x,
                    top: mapHelper.tileHeight * j + offset.y,
                    width: mapHelper.tileWidth,
                    height: mapHelper.tileHeight
                });
            }
        }
        tiles.sort((a, b) => {
            let adx = a.left + mapHelper.tileWidth / 2 - this.state.width / 2;
            let ady = a.top + mapHelper.tileHeight / 2 - this.state.height / 2;
            let bdx = b.left + mapHelper.tileWidth / 2 - this.state.width / 2;
            let bdy = b.top + mapHelper.tileHeight / 2 - this.state.height / 2;
            let adr = adx * adx + ady * ady;
            let bdr = bdx * bdx + bdy * bdy;
            return adr - bdr;
        });

        return <Canvas ref="canvas" width={this.state.width} height={this.state.height} tabIndex={0}>
            {tiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height}/>)}
            <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
        </Canvas>;
    }
};
