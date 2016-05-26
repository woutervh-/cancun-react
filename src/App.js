import React from 'react';
import LocalStorageComponent from './LocalStorageComponent';
import {Map} from './Map';
import {TileLayer} from './Map/Layers';

export default class App extends LocalStorageComponent {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    state = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    componentDidMount() {
        this.setPersistenceKey('app');
        this.setStateMapping(state => ({view: state.view, mapStyle: state.mapStyle, traffic: state.traffic}));
        this.restoreState();

        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    render() {
        return <Map width={this.state.width} height={this.state.height}>
            <TileLayer url="https://{s}.api.tomtom.com/lbs/map/3/basic/1/{z}/{x}/{y}.png?key=wqz3ad2zvhnfsnwpddk6wgqq&tileSize=256" displayCachedTiles={true}/>
        </Map>;

        //return <span>
        //    <TopBar onSearchSubmit={this.handleSearchSubmit}
        //            onSearchClear={this.handleSearchClear}
        //            onMapSelect={this.handleMapSelect}
        //            mapStyle={this.state.mapStyle}
        //            onTrafficChange={this.handleTrafficChange}
        //            onTrafficToggle={this.handleTrafficToggle}
        //            traffic={this.state.traffic}/>
        //    <MapView view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleLongViewChange} onLocationSelect={this.handleLocationSelect} onTap={this.handleMapTap}>
        //        <MapTilesLayer tileProvider={MapHelper} style={this.state.mapStyle} displayCachedTiles={true}/>
        //        <MapTilesLayer tileProvider={FlowHelper} style={this.state.traffic.flowStyle} active={this.state.traffic.show && this.state.traffic.showFlow}/>
        //        <MapTilesLayer tileProvider={TrafficHelper} style="s3" active={this.state.traffic.show && this.state.traffic.showTubes}/>
        //        {this.state.traffic.show && this.state.traffic.showIcons
        //            ? this.state.traffic.trafficIcons.map((poi, index) => {
        //            let {p: {x: longitude, y: latitude}} = poi;
        //            const IconType = IncidentsHelper.lookupIconType(poi);
        //            // <IconType viewBox="0 0 20 20"/>
        //            return <MapLayer key={index} latitude={latitude} longitude={longitude} render="html">
        //                <img src="images/place-holder.svg" width="20" height="20"/>
        //            </MapLayer>;
        //        })
        //            : null}
        //        <MapLayer {...this.state.locationMarkerInformation.location} render="html" active={this.state.locationMarker.show}>
        //            <Marker onTap={this.handleLocationMarkerTap} style={{width: '2rem', height: '3rem'}}>
        //                <SearchMarker viewBox="0 0 20 30"/>
        //            </Marker>
        //        </MapLayer>
        //        <MapLayer {...this.state.locationBoxInformation.location} render="html" active={this.state.locationBox.show}>
        //            <LocationInfoBox onClearClick={this.handleSearchClear} locationInformation={this.state.locationBoxInformation}/>
        //        </MapLayer>
        //    </MapView>
        //</span>;
    }
};
