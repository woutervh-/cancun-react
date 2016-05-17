import {TopBar} from './Toolbar';
import LocationInfoBox from './LocationInfoBox';
import {MapHelper, MapLayer, MapTilesLayer, MapView, MapViewController, TrafficHelper} from './Map';
import {Composition} from './Map/canvas';
import React from 'react';
import SearchMarker from '../public/images/search-marker';
import {Marker} from './Marker';
import LocalStorageComponent from './LocalStorageComponent';

export default class App extends LocalStorageComponent {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSearchClear = this.handleSearchClear.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
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
    }

    handleSearchSubmit(input) {
        if (!!input) {
            let toZoom = Math.max(12, Math.floor(this.state.view.zoom));
            let center = MapHelper.project(input, toZoom);
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

    handleViewChange(view) {
        this.setState({view});
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
    }

    handleTrafficToggle(active) {
        this.setState({traffic: {...this.state.traffic, show: active}});
    }

    render() {
        let projectedView = MapHelper.unproject(this.state.view, Math.floor(this.state.view.zoom));

        return <span>
            <TopBar onSearchSubmit={this.handleSearchSubmit}
                    onSearchClear={this.handleSearchClear}
                    onMapSelect={this.handleMapSelect}
                    mapStyle={this.state.mapStyle}
                    onTrafficChange={this.handleTrafficChange}
                    onTrafficToggle={this.handleTrafficToggle}
                    traffic={this.state.traffic}/>
            <MapView view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleViewChange} onLocationSelect={this.handleLocationSelect} onTap={this.handleMapTap}>
                <MapTilesLayer tileProvider={MapHelper} style={this.state.mapStyle} displayCachedTiles={true}/>
                <MapTilesLayer tileProvider={TrafficHelper} style="s3"/>
                <MapLayer {...this.state.locationMarkerInformation.location} render="html">
                    {this.state.locationMarker.show
                        ? <Marker width={20} height={30} onTap={this.handleLocationMarkerTap} style={{width: '2rem', height: '3rem'}}><SearchMarker/></Marker>
                        : null}
                </MapLayer>
                <MapLayer {...this.state.locationBoxInformation.location} render="html">
                    <LocationInfoBox onClearClick={this.handleSearchClear}
                                     active={this.state.locationBox.show}
                                     locationInformation={this.state.locationBoxInformation}/>
                </MapLayer>
            </MapView>
        </span>;
    }
};
