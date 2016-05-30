import React from 'react';
import LocalStorageComponent from './LocalStorageComponent';
import {Map} from './Map';
import {Marker, TileLayer} from './Map/Layers';
import {Toolbar} from './Toolbar';
import SearchMarker from './Icons/search-marker';

export default class App extends LocalStorageComponent {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLocationSelect = this.handleLocationSelect.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    }

    state = {
        width: window.innerWidth,
        height: window.innerHeight,
        view: {
            center: {
                latitude: 0,
                longitude: 0
            },
            zoom: 0
        }
    };

    componentDidMount() {
        this.setPersistenceKey('app');
        this.setStateMapping(state => ({view: state.view}));
        this.restoreState();

        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    handleViewChange(view) {
        this.setState({view});
    }

    handleLocationSelect() {

    }

    handleSearchSubmit(result) {
        let {latitude, longitude, isCoordinate, location} = result;
        let zoom = Math.max(this.refs.map.zoom(), 12);
        this.setState({
            view: {
                center: {latitude, longitude},
                zoom
            }
        });
    }

    render() {
        let img = new Image();
        img.src = SearchMarker;

        return <div>
            <Toolbar
                onSearchSubmit={this.handleSearchSubmit}/>
            <Map
                ref="map"
                center={this.state.view.center}
                zoom={this.state.view.zoom}
                width={this.state.width}
                height={this.state.height}
                onViewChange={this.handleViewChange}
                onLocationSelect={this.handleLocationSelect}>
                <TileLayer url="https://{s}.api.tomtom.com/lbs/map/3/basic/1/{z}/{x}/{y}.png?key=wqz3ad2zvhnfsnwpddk6wgqq&tileSize=256" displayCachedTiles={true}/>
                <Marker position={{latitude: 0, longitude: 0}} width={20} height={30} image={img}/>
                <Marker position={{latitude: 0, longitude: 1}} width={20} height={30} image={img}/>
            </Map>
        </div>;

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
