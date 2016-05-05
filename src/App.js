import TopBar from './TopBar';
import LocationInfoBox from './LocationInfoBox';
import {MapHelper, MapLayer, MapTilesLayer, MapView, MapViewController} from './map';
import {Picture} from './map/canvas';
import React from 'react';
import SearchBar from './SearchBar';
import style from './style';
import VectorUtil from './VectorUtil';
import SearchMarker from '../public/images/search-marker';
import Marker from './Marker';
import EventUtil from './EventUtil';

export default class App extends React.Component {
    constructor() {
        super();
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSearchClear = this.handleSearchClear.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLocationSelect = this.handleLocationSelect.bind(this);
        this.handleLocationMarkerTap = this.handleLocationMarkerTap.bind(this);
        this.handleMapTap = this.handleMapTap.bind(this);
        this.handleRemoveFocus = this.handleRemoveFocus.bind(this);
    }

    state = {
        view: {
            x: 0,
            y: 0,
            zoom: 0
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
        },
        debug: []
    };

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

    handleRemoveFocus(event) {
        if(!EventUtil.targetIsDescendant(event, this.refs.marker.refs.container)) {
            this.setState({locationBox: {show: false}});
        }
    }

    render() {
        return <span>
            <TopBar onSearchSubmit={this.handleSearchSubmit}
                    onSearchClear={this.handleSearchClear}
                    onDrawClick={this.handleToggle}/>
            <MapView view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleViewChange} onLocationSelect={this.handleLocationSelect} onTap={this.handleMapTap}>
                <MapTilesLayer/>
                <MapLayer {...this.state.locationMarkerInformation.location} render="html">
                    {this.state.locationMarker.show
                        ? <Marker width={20} height={30} onTap={this.handleLocationMarkerTap} ref="marker"><SearchMarker/></Marker>
                        : null}
                </MapLayer>
                <MapLayer {...this.state.locationBoxInformation.location} render="html">
                    <LocationInfoBox onClearClick={this.handleSearchClear}
                                     onRemoveFocus={this.handleRemoveFocus}
                                     active={this.state.locationBox.show}
                                     locationInformation={this.state.locationBoxInformation}/>
                </MapLayer>
            </MapView>
        </span>;
    }
};
