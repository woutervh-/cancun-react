import React from 'react';
import ImageFrontier from './ImageFrontier';

export default function MapTilesLayerWrapper(Component) {
    return class MapTilesLayerWrapperComposed extends React.Component {
        static propTypes = {
            width: React.PropTypes.number.isRequired,
            height: React.PropTypes.number.isRequired,
            zoomLevel: React.PropTypes.number.isRequired,
            scale: React.PropTypes.number.isRequired,
            imageFrontier: React.PropTypes.instanceOf(ImageFrontier).isRequired
        };

        generateTilesList({x = 0, y = 0} = {}, deltaZoomLevel = 0) {
            let deltaScale = Math.pow(2, deltaZoomLevel);
            let startTile = {
                x: Math.floor((x - this.props.preloadHorizontal * this.props.width) / MapHelper.tileWidth * deltaScale),
                y: Math.floor((y - this.props.preloadVertical * this.props.height) / MapHelper.tileHeight * deltaScale)
            };
            let endTile = {
                x: Math.ceil((x + (1 + this.props.preloadHorizontal) * this.props.width) / MapHelper.tileWidth * deltaScale),
                y: Math.ceil((y + (1 + this.props.preloadVertical) * this.props.height) / MapHelper.tileHeight * deltaScale)
            };
            let offset = {
                x: startTile.x * MapHelper.tileWidth / deltaScale - x,
                y: startTile.y * MapHelper.tileHeight / deltaScale - y
            };
            let tiles = [];
            for (let i = 0; i < endTile.x - startTile.x; i++) {
                for (let j = 0; j < endTile.y - startTile.y; j++) {
                    tiles.push({
                        url: this.props.tileProvider.getTileUrl(startTile.x + i, startTile.y + j, this.props.zoomLevel + deltaZoomLevel, this.props.style),
                        left: MapHelper.tileWidth / deltaScale * i + offset.x,
                        top: MapHelper.tileHeight / deltaScale * j + offset.y,
                        width: MapHelper.tileWidth / deltaScale,
                        height: MapHelper.tileHeight / deltaScale
                    });
                }
            }
            return tiles;
        }

        render() {
            let topLeft = {
                x: this.props.x - this.props.width / 2 / this.props.scale,
                y: this.props.y - this.props.height / 2 / this.props.scale
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
                if (this.props.zoomLevel + deltaLevelLow >= MapHelper.minZoomLevel) {
                    preloadTiles = preloadTiles.concat(this.generateTilesList(topLeft, deltaLevelLow));
                }
                if (this.props.zoomLevel + deltaLevelHigh <= MapHelper.maxZoomLevel) {
                    preloadTiles = preloadTiles.concat(this.generateTilesList(topLeft, deltaLevelHigh));
                }
            }

            let byDistanceFromCenter = (a, b) => {
                let adx = a.left + MapHelper.tileWidth / 2 - this.props.width / 2;
                let ady = a.top + MapHelper.tileHeight / 2 - this.props.height / 2;
                let bdx = b.left + MapHelper.tileWidth / 2 - this.props.width / 2;
                let bdy = b.top + MapHelper.tileHeight / 2 - this.props.height / 2;
                let adr = adx * adx + ady * ady;
                let bdr = bdx * bdx + bdy * bdy;
                return adr - bdr;
            };
            tiles.sort(byDistanceFromCenter);
            preloadTiles.sort(byDistanceFromCenter);

            if (this.props.imageFrontier.isLoaded(picture.props.source) && picture.props.display) {
                let image = this.props.imageFrontier.getLoadedImage(picture.props.source);
                context.drawImage(image, picture.props.left, picture.props.top, picture.props.width, picture.props.height);
            } else if (!picture.props.forceFromCache) {
                this.props.imageFrontier.fetch(picture.props.source, picture.props.priority);
                this.props.imageFrontier.setCallback(picture.props.source, () => this.setState({count: this.state.count + 1}));
            }

            return <Scale scaleWidth={this.props.scale} scaleHeight={this.props.scale}>
                <Component {...this.props}>
                    {cachedTiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height} forceFromCache={true}/>)}
                    {tiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height} priority={this.props.localToGlobalPriority(MapTilesLayer.highPriority)}/>)}
                    {preloadTiles.map((tile, index) => <Picture key={index} source={tile.url} left={tile.left} top={tile.top} width={tile.width} height={tile.height} display={false} priority={this.props.localToGlobalPriority(MapTilesLayer.lowPriority)}/>)}
                    {this.props.children}
                </Component>
            </Scale>;
        }
    };
};
