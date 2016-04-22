import Canvas from './canvas/Canvas.jsx';
import ImageFrontier from './canvas/ImageFrontier.js';
import MapHelper from './MapHelper.js';
import Picture from './canvas/Picture.jsx';
import React from 'react';
import Rectangle from './canvas/Rectangle.jsx';
import Scale from './canvas/Scale.jsx';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.imageFrontier = new ImageFrontier((a, b) => {
            // TODO: not working: a/b are image urls (look at https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)
            let adx = a.left + MapHelper.tileWidth / 2 - this.state.width / 2;
            let ady = a.top + MapHelper.tileHeight / 2 - this.state.height / 2;
            let bdx = b.left + MapHelper.tileWidth / 2 - this.state.width / 2;
            let bdy = b.top + MapHelper.tileHeight / 2 - this.state.height / 2;
            let adr = adx * adx + ady * ady;
            let bdr = bdx * bdx + bdy * bdy;
            return adr - bdr;
        });
    }

    static propTypes = {
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
        zoomLevel: React.PropTypes.number.isRequired,
        scale: React.PropTypes.number.isRequired,
        preloadHorizontal: React.PropTypes.number.isRequired,
        preloadVertical: React.PropTypes.number.isRequired,
        preloadLevels: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        scale: 1,
        preloadHorizontal: 0,
        preloadVertical: 0,
        preloadLevels: 0
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
            x: Math.floor((topLeft.x - this.props.preloadHorizontal * this.state.width) / MapHelper.tileWidth),
            y: Math.floor((topLeft.y - this.props.preloadVertical * this.state.height) / MapHelper.tileHeight)
        };
        let endTile = {
            x: Math.ceil((topLeft.x + (1 + this.props.preloadHorizontal) * this.state.width) / MapHelper.tileWidth),
            y: Math.ceil((topLeft.y + (1 + this.props.preloadVertical) * this.state.height) / MapHelper.tileHeight)
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

        let preTopLeft = {
            x: this.props.x - this.state.width / 2 / this.props.scale,
            y: this.props.y - this.state.height / 2 / this.props.scale
        };
        let preStartTile = {
            x: Math.floor(preTopLeft.x / MapHelper.tileWidth / 2),
            y: Math.floor(preTopLeft.y / MapHelper.tileHeight / 2)
        };
        let preEndTile = {
            x: Math.ceil((preTopLeft.x + this.state.width) / MapHelper.tileWidth / 2),
            y: Math.ceil((preTopLeft.y + this.state.height) / MapHelper.tileHeight / 2)
        };
        let preOffset = {
            x: preStartTile.x * MapHelper.tileWidth * 2 - preTopLeft.x,
            y: preStartTile.y * MapHelper.tileHeight * 2 - preTopLeft.y
        };

        let preTiles = [];
        for (let i = 0; i < preEndTile.x - preStartTile.x; i++) {
            for (let j = 0; j < preEndTile.y - preStartTile.y; j++) {
                preTiles.push({
                    url: MapHelper.getTileUrl(preStartTile.x + i, preStartTile.y + j, this.props.zoomLevel - 1),
                    left: MapHelper.tileWidth * 2 * i + preOffset.x,
                    top: MapHelper.tileHeight * 2 * j + preOffset.y,
                    width: MapHelper.tileWidth * 2,
                    height: MapHelper.tileHeight * 2
                });
            }
        }

        return <Canvas ref="canvas" width={this.state.width} height={this.state.height} tabIndex={0} imageFrontier={this.imageFrontier}>
            <Scale scaleWidth={this.props.scale} scaleHeight={this.props.scale}>
                {preTiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height}/>)}
                {tiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height}/>)}
            </Scale>
            <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
        </Canvas>;
    }
};
