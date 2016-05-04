import TopBar from './TopBar';
import LocationInfoBox from './LocationInfoBox';
import {MapHelper, MapLayer, MapTilesLayer, MapView, MapViewController} from './map';
import {Picture} from './map/canvas';
import React from 'react';
import SearchBar from './SearchBar';
import style from './style';
import VectorUtil from './VectorUtil';
import SearchMarker from '../public/images/search-marker';
import Marker from './Marker'

export default class App extends React.Component {
    constructor() {
        super();
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSearchClear = this.handleSearchClear.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLocationSelect = this.handleLocationSelect.bind(this);
        this.handleLocationMarkerTap = this.handleLocationMarkerTap.bind(this);
        this.handleMapTap = this.handleMapTap.bind(this);
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

    handleLocationMarkerTap(event) {
        //event.srcEvent.preventDefault();
        //event.srcEvent.stopPropagation();
        console.log('marker tap');
        this.setState({debug: [...this.state.debug, 'marker tap']});
        this.setState({
            locationBox: {show: true},
            locationBoxInformation: this.state.locationMarkerInformation
        });
    }

    handleMapTap(event) {
        console.log('map tap');
        this.setState({debug: [...this.state.debug, 'map tap ' + event.target]});
        this.setState({locationBox: {show: false}});
    }

    render() {
        let zoomLevel = Math.round(this.state.view.zoom);
        let scale = Math.pow(2, this.state.view.zoom - zoomLevel);
        let view = VectorUtil.multiply(this.state.view, Math.pow(2, zoomLevel - Math.floor(this.state.view.zoom)));

        return <span>
            <TopBar onSearchSubmit={this.handleSearchSubmit}
                    onSearchClear={this.handleSearchClear}
                    onDrawClick={this.handleToggle}/>
            <MapViewController view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleViewChange} onLocationSelect={this.handleLocationSelect} onTap={this.handleMapTap}>
                <MapView {...view} zoomLevel={zoomLevel} scale={scale}>
                    <MapTilesLayer/>
                    <MapLayer {...this.state.locationMarkerInformation.location} render="html">
                        {this.state.locationMarker.show
                            ? <Marker width={20} height={30} onTap={this.handleLocationMarkerTap}><SearchMarker/></Marker>
                            : null}
                    </MapLayer>
                    <MapLayer {...this.state.locationBoxInformation.location} render="html">
                        <LocationInfoBox onClearClick={this.handleSearchClear} /* TODO: problem: event handles by MapViewController contain this element */
                                         active={this.state.locationBox.show}
                                         locationInformation={this.state.locationBoxInformation}/>
                    </MapLayer>
                </MapView>
            </MapViewController>
            <span style={{position: 'absolute', top: '4em', left: 0}}>
                {JSON.stringify(this.state.debug, null, 2)}
            </span>
        </span>;
    }
};
