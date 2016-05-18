import {TopBar} from './Toolbar';
import LocationInfoBox from './LocationInfoBox';
import {MapHelper, MapLayer, MapTilesLayer, MapView, MapViewController, TrafficHelper} from './Map';
import {WebMercator} from './Map/Projections';
import {Composition, Picture} from './Map/canvas';
import React from 'react';
import SearchMarker from '../public/images/search-marker';
import {Marker} from './Marker';
import LocalStorageComponent from './LocalStorageComponent';
import {IncidentsHelper} from './Map/Incidents';
import VectorUtil from './VectorUtil';

export default class App extends LocalStorageComponent {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSearchClear = this.handleSearchClear.bind(this);
        this.handleLongViewChange = this.handleLongViewChange.bind(this);
        this.updateIncidents = this.updateIncidents.bind(this);
        this.handleLocationSelect = this.handleLocationSelect.bind(this);
        this.handleLocationMarkerTap = this.handleLocationMarkerTap.bind(this);
        this.handleMapTap = this.handleMapTap.bind(this);
        this.handleMapSelect = this.handleMapSelect.bind(this);
        this.handleTrafficChange = this.handleTrafficChange.bind(this);
        this.handleTrafficToggle = this.handleTrafficToggle.bind(this);
    }

    state = {
        view: {
            x: 0,
            y: 0,
            zoom: 0
        },
        mapStyle: MapHelper.styles[0].value,
        traffic: {
            show: false,
            showTubes: false,
            showIcons: false
        },
        locationMarker: {
            show: false
        },
        locationMarkerInformation: {
            name: '',
            location: {
                latitude: 0,
                longitude: 0
            }
        },
        locationBox: {
            show: false
        },
        locationBoxInformation: {
            name: '',
            location: {
                latitude: 0,
                longitude: 0
            }
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
            let toZoom = Math.max(12, Math.floor(this.state.view.zoom));
            let center = WebMercator.project(input, toZoom);
            this.setState({
                view: {
                    x: center.x,
                    y: center.y,
                    zoom: toZoom
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

    render() {
        let img = new Image();
        img.src = 'http://cancun.flatns.net/images/traffic-icons/cropped/traffic-major.png';

        return <span>
            <TopBar onSearchSubmit={this.handleSearchSubmit}
                    onSearchClear={this.handleSearchClear}
                    onMapSelect={this.handleMapSelect}
                    mapStyle={this.state.mapStyle}
                    onTrafficChange={this.handleTrafficChange}
                    onTrafficToggle={this.handleTrafficToggle}
                    traffic={this.state.traffic}/>
            <MapView view={this.state.view} onLongViewChange={this.handleLongViewChange} onLocationSelect={this.handleLocationSelect} onTap={this.handleMapTap}>
                <MapTilesLayer tileProvider={MapHelper} style={this.state.mapStyle} displayCachedTiles={true}/>
                {this.state.traffic.show && this.state.traffic.showTubes
                    ? <MapTilesLayer tileProvider={TrafficHelper} style="s3"/>
                    : null}
                {this.state.traffic.show && this.state.traffic.showIcons
                    ? <MapLayer latitude={0} longitude={0} render="html">
                    {this.state.traffic.trafficIcons.map((poi, index) => {
                        let {p: {x: longitude, y: latitude}} = poi;
                        let offset = VectorUtil.subtract(WebMercator.project({latitude, longitude}, Math.round(this.state.view.zoom)), WebMercator.project(this.state.view, Math.round(this.state.view.zoom)));
                        // const IconType = IncidentsHelper.lookupIconType(poi);
                        // <IconType viewBox="0 0 20 20"/>
                        return <img key={index} src="images/place-holder.svg" width="20" height="20" style={{position: 'absolute', top: offset.y - 10, left: offset.x - 10}}/>;
                    })}
                </MapLayer>
                    : null}
                <MapLayer {...this.state.locationMarkerInformation.location} render="html">
                    {this.state.locationMarker.show
                        ? <Marker onTap={this.handleLocationMarkerTap} style={{width: '2rem', height: '3rem'}}><SearchMarker viewBox="0 0 20 30"/></Marker>
                        : null}
                </MapLayer>
                <MapLayer {...this.state.locationBoxInformation.location} render="html">
                    <LocationInfoBox onClearClick={this.handleSearchClear} active={this.state.locationBox.show} locationInformation={this.state.locationBoxInformation}/>
                </MapLayer>
            </MapView>
        </span>;
    }
};
