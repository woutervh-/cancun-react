import MapHelper from './MapHelper';
import MapLayer from './MapLayer';
import React from 'react';
import {Canvas, Composition, Picture, Rectangle, Scale, Translate} from './canvas';
import VectorUtil from '../VectorUtil';

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
        scale: React.PropTypes.number.isRequired,
        preloadHorizontal: React.PropTypes.number.isRequired,
        preloadVertical: React.PropTypes.number.isRequired,
        preloadLevels: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        scale: 1,
        preloadHorizontal: 0.5,
        preloadVertical: 0.5,
        preloadLevels: 1
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

    generateTilesList({x = 0, y = 0} = {}, deltaZoomLevel = 0) {
        let deltaScale = Math.pow(2, deltaZoomLevel);
        let startTile = {
            x: Math.floor((x - this.props.preloadHorizontal * this.state.width) / MapHelper.tileWidth * deltaScale),
            y: Math.floor((y - this.props.preloadVertical * this.state.height) / MapHelper.tileHeight * deltaScale)
        };
        let endTile = {
            x: Math.ceil((x + (1 + this.props.preloadHorizontal) * this.state.width) / MapHelper.tileWidth * deltaScale),
            y: Math.ceil((y + (1 + this.props.preloadVertical) * this.state.height) / MapHelper.tileHeight * deltaScale)
        };
        let offset = {
            x: startTile.x * MapHelper.tileWidth / deltaScale - x,
            y: startTile.y * MapHelper.tileHeight / deltaScale - y
        };
        let tiles = [];
        for (let i = 0; i < endTile.x - startTile.x; i++) {
            for (let j = 0; j < endTile.y - startTile.y; j++) {
                tiles.push({
                    url: MapHelper.getTileUrl(startTile.x + i, startTile.y + j, this.props.zoomLevel + deltaZoomLevel),
                    left: MapHelper.tileWidth / deltaScale * i + offset.x,
                    top: MapHelper.tileHeight / deltaScale * j + offset.y,
                    width: MapHelper.tileWidth / deltaScale,
                    height: MapHelper.tileHeight / deltaScale
                });
            }
        }
        return tiles;
    }

    transformLayer(layer) {
        let center = MapHelper.project(layer.props, this.props.zoomLevel);
        let offset = VectorUtil.add(VectorUtil.subtract(center, this.props), {
            x: this.state.width / 2 / this.props.scale,
            y: this.state.height / 2 / this.props.scale
        });
        return <Translate {...offset}>
            <Scale scaleWidth={1 / this.props.scale} scaleHeight={1 / this.props.scale}>
                {layer.props.children}
            </Scale>
        </Translate>;
    }

    render() {
        let topLeft = {
            x: this.props.x - this.state.width / 2 / this.props.scale,
            y: this.props.y - this.state.height / 2 / this.props.scale
        };

        let tiles = this.generateTilesList(topLeft, 0);

        let cachedTiles = [];
        for (let i = 0; i < this.props.zoomLevel; i++) {
            cachedTiles = this.generateTilesList(topLeft, i - this.props.zoomLevel).concat(cachedTiles);
        }

        let preloadTiles = [];
        for (let i = 0; i < this.props.preloadLevels; i++) {
            let deltaLevelLow = -(i + 1);
            let deltaLevelHigh = i + 1;
            if (this.props.zoomLevel + deltaLevelLow >= MapHelper.minZoom) {
                preloadTiles = preloadTiles.concat(this.generateTilesList(topLeft, deltaLevelLow));
            }
            if (this.props.zoomLevel + deltaLevelHigh <= MapHelper.maxZoom) {
                preloadTiles = preloadTiles.concat(this.generateTilesList(topLeft, deltaLevelHigh));
            }
        }

        let byDistanceFromCenter = (a, b) => {
            let adx = a.left + MapHelper.tileWidth / 2 - this.state.width / 2;
            let ady = a.top + MapHelper.tileHeight / 2 - this.state.height / 2;
            let bdx = b.left + MapHelper.tileWidth / 2 - this.state.width / 2;
            let bdy = b.top + MapHelper.tileHeight / 2 - this.state.height / 2;
            let adr = adx * adx + ady * ady;
            let bdr = bdx * bdx + bdy * bdy;
            return adr - bdr;
        };
        tiles.sort(byDistanceFromCenter);
        preloadTiles.sort(byDistanceFromCenter);

        return <Canvas ref="canvas" width={this.state.width} height={this.state.height}>
            <Scale scaleWidth={this.props.scale} scaleHeight={this.props.scale}>
                <Composition type="destination-over">
                    <Composition type="source-over">
                        {tiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height}/>)}
                        {React.Children.map(this.props.children, child => {
                            switch (child.type) {
                                case MapLayer:
                                    return this.transformLayer(child);
                                default:
                                    return child;
                            }
                        })}
                    </Composition>
                    {cachedTiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height} forceFromCache={true}/>)}
                    {preloadTiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height} display={false}/>)}
                </Composition>
            </Scale>
            <Rectangle width={this.state.width} height={this.state.height} strokeStyle="rgba(255, 0, 0, 1)" fillStyle="rgba(0, 0, 0, 0)"/>
        </Canvas>;
    }
};
