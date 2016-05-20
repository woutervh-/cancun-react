import {TopBar} from './Toolbar';
import LocationInfoBox from './LocationInfoBox';
import {FlowHelper, MapHelper, MapView, MapViewController, TrafficHelper} from './Map';
import {WebMercator} from './Map/Projections';
import {Composition, Picture} from './Map/Canvas';
import React from 'react';
import SearchMarker from '../public/images/search-marker';
import LocalStorageComponent from './LocalStorageComponent';
import {IncidentsHelper} from './Map/Incidents';
import {LayerGroup, Map, Marker, Popup, TileLayer} from 'react-leaflet';
import Leaflet from 'leaflet';
import leafletStyle from './leaflet-style';

export default class App extends LocalStorageComponent {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSearchClear = this.handleSearchClear.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLongViewChange = this.handleLongViewChange.bind(this);
        this.updateIncidents = this.updateIncidents.bind(this);
        this.handleLocationSelect = this.handleLocationSelect.bind(this);
        this.handleLocationMarkerTap = this.handleLocationMarkerTap.bind(this);
        this.handleMapTap = this.handleMapTap.bind(this);
        this.handleMapSelect = this.handleMapSelect.bind(this);
        this.handleTrafficChange = this.handleTrafficChange.bind(this);
        this.handleTrafficToggle = this.handleTrafficToggle.bind(this);
        this.handleMoveEnd = this.handleMoveEnd.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    state = {
        view: {
            position: {
                latitude: 0,
                longitude: 0
            },
            zoomLevel: 0
        },
        mapStyle: MapHelper.styles[0].value,
        traffic: {
            show: false,
            showTubes: false,
            showIcons: false,
            showFlow: false,
            flowStyle: FlowHelper.styles[0].value
        },
        locationMarker: {
            show: false,
            position: {
                latitude: 0,
                longitude: 0
            }
        },
        locationBox: {
            show: false,
            position: {
                latitude: 0,
                longitude: 0
            },
            name: '',
            details: ''
        }
    };

    componentDidMount() {
        this.setPersistenceKey('app');
        this.setStateMapping(state => ({view: state.view, mapStyle: state.mapStyle, traffic: state.traffic}));
        this.restoreState();
        this.updateIncidents(this.state.view);
    }

    handleSearchSubmit(input) {
        if (!!input) {
            let toZoomLevel = Math.max(12, Math.floor(this.state.view.zoom));
            this.setState({
                view: {
                    position: {
                        latitude: input.latitude,
                        longitude: input.longitude
                    },
                    zoomLevel: toZoomLevel
                },
                locationMarker: {
                    show: true
                },
                locationMarkerInformation: {
                    name: input.isCoordinate ? 'Coordinate' : input.location,
                    location: {
                        latitude: input.latitude,
                        longitude: input.longitude
                    }
                },
                locationBox: {
                    show: false
                }
            });
        }
    }

    handleLocationSelect(location, withDetails = false) {
        this.setState({
            locationMarker: {
                show: true
            },
            locationMarkerInformation: {
                name: 'Coordinate',
                location
            },
            locationBox: {
                show: withDetails
            },
            locationBoxInformation: withDetails ? {
                name: 'Coordinate',
                location
            } : this.state.locationBoxInformation
        });
    }

    handleSearchClear() {
        this.setState({locationMarker: {show: false}, locationBox: {show: false}});
    }

    handleViewChange(view) {
        this.setState({view});
    }

    handleLongViewChange(view) {
        this.setState({view});
        this.updateIncidents(view);
    }

    updateIncidents(view, force = false) {
        if (force || this.state.traffic.show && this.state.traffic.showIcons) {
            let zoomLevel = Math.round(view.zoom);
            IncidentsHelper.viewportDescription(view, zoomLevel, (error, data)=> {
                if (!error) {
                    IncidentsHelper.trafficIcons(view, zoomLevel, data['viewpResp']['trafficState']['@trafficModelId'], (error, data) => {
                        if (!error) {
                            this.setState({traffic: {...this.state.traffic, trafficIcons: data['tm']['poi']}});
                        }
                    });
                }
            });
        }
    }

    handleLocationMarkerTap() {
        this.setState({
            locationBox: {show: true},
            locationBoxInformation: this.state.locationMarkerInformation
        });
    }

    handleMapTap() {
        this.setState({locationBox: {show: false}});
    }

    handleMapSelect(value) {
        this.setState({mapStyle: value});
    }

    handleTrafficChange(traffic) {
        this.setState({traffic: {...this.state.traffic, ...traffic}});
        this.updateIncidents(this.state.view, true); // todo: smarter strategy for updating traffic incidents
    }

    handleTrafficToggle(active) {
        this.setState({traffic: {...this.state.traffic, show: active}});
    }

    handleMoveEnd() {
        let {lat: latitude, lng: longitude} = this.refs.map.getLeafletElement().getCenter();
        let zoomLevel = this.refs.map.getLeafletElement().getZoom();
        let view = {position: {latitude, longitude}, zoomLevel};
        this.setState({view});
    }

    handleContextMenu(event) {
        const displayNumber = number => Math.round(number * 1000000) / 1000000;
        let {lat: latitude, lng: longitude} = event.latlng;
        this.setState({
            locationMarker: {
                show: true,
                position: {latitude, longitude}
            },
            locationBox: {
                show: true,
                position: {latitude, longitude},
                name: 'Coordinate',
                details: [latitude, longitude].map(displayNumber).join(', ')
            }
        });
    }

    handleClick() {
        this.setState({
            locationBox: {
                ...this.state.locationBox,
                show: false
            }
        });
    }

    render() {
        return <span>
            <TopBar onSearchSubmit={this.handleSearchSubmit}
                    onSearchClear={this.handleSearchClear}
                    onMapSelect={this.handleMapSelect}
                    mapStyle={this.state.mapStyle}
                    onTrafficChange={this.handleTrafficChange}
                    onTrafficToggle={this.handleTrafficToggle}
                    traffic={this.state.traffic}/>
            <Map ref="map"
                 center={[this.state.view.position.latitude, this.state.view.position.longitude]}
                 zoom={this.state.view.zoomLevel}
                 zoomControl={false}
                 attributionControl={false}
                 style={{height: '100%', width: '100%', cursor: 'default'}}
                 onClick={this.handleClick}
                 onMoveend={this.handleMoveEnd}
                 onContextmenu={this.handleContextMenu}>
                <TileLayer url="https://{s}.api.tomtom.com/lbs/map/3/basic/1/{z}/{x}/{y}.png?key=wqz3ad2zvhnfsnwpddk6wgqq&tileSize=256" subdomains={['a', 'b', 'c', 'd']}/>
                {this.state.locationMarker.show
                    ? <Marker
                    position={[this.state.locationMarker.position.latitude, this.state.locationMarker.position.longitude]}
                    icon={
                        new Leaflet.ReactIcon({
                            element: <SearchMarker viewBox="0 0 20 30"/>,
                            iconAnchor: [10, 30]
                        })
                    }/>
                    : null}
                <LocationInfoBox onClearClick={this.handleSearchClear} locationInformation={this.state.locationBox} active={this.state.locationBox.show}/>
            </Map>
        </span>;

        //<MapView view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleLongViewChange} onLocationSelect={this.handleLocationSelect} onTap={this.handleMapTap}>
        //    <MapTilesLayer tileProvider={MapHelper} style={this.state.mapStyle} displayCachedTiles={true}/>
        //    <MapTilesLayer tileProvider={FlowHelper} style={this.state.traffic.flowStyle} active={this.state.traffic.show && this.state.traffic.showFlow}/>
        //    <MapTilesLayer tileProvider={TrafficHelper} style="s3" active={this.state.traffic.show && this.state.traffic.showTubes}/>
        //    {this.state.traffic.show && this.state.traffic.showIcons
        //        ? this.state.traffic.trafficIcons.map((poi, index) => {
        //        let {p: {x: longitude, y: latitude}} = poi;
        //        const IconType = IncidentsHelper.lookupIconType(poi);
        //        // <IconType viewBox="0 0 20 20"/>
        //        return <MapLayer key={index} latitude={latitude} longitude={longitude} render="html">
        //            <img src="images/place-holder.svg" width="20" height="20"/>
        //        </MapLayer>;
        //    })
        //        : null}
        //    <MapLayer {...this.state.locationMarkerInformation.location} render="html" active={this.state.locationMarker.show}>
        //        <Marker onTap={this.handleLocationMarkerTap} style={{width: '2rem', height: '3rem'}}>
        //            <SearchMarker viewBox="0 0 20 30"/>
        //        </Marker>
        //    </MapLayer>
        //    <MapLayer {...this.state.locationBoxInformation.location} render="html" active={this.state.locationBox.show}>
        //        <LocationInfoBox onClearClick={this.handleSearchClear} locationInformation={this.state.locationBoxInformation}/>
        //    </MapLayer>
        //</MapView>
    }
};
