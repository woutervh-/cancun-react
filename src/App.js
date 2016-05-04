import TopBar from './TopBar';
import LocationInfoBox from './LocationInfoBox';
import {MapHelper, MapLayer, MapTilesLayer, MapView, MapViewController} from './map';
import {Picture} from './map/canvas';
import React from 'react';
import SearchBar from './SearchBar';
import style from './style';
import VectorUtil from './VectorUtil';

export default class App extends React.Component {
    constructor() {
        super();
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSearchClear = this.handleSearchClear.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLongViewChange = this.handleLongViewChange.bind(this);
        this.handleLocationSelect = this.handleLocationSelect.bind(this);
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
        locationInformation: {
            name: '',
            location: {
                latitude: 0,
                longitude: 0
            }
        }
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
                locationInformation: {
                    name: input.isCoordinate ? 'Coordinate' : input.location,
                    location: {
                        latitude: input.latitude,
                        longitude: input.longitude
                    }
                }
            });
        }
    }

    handleLocationSelect(location, withDetails = false) {
        this.setState({
            locationMarker: {
                show: true
            },
            locationInformation: {
                name: 'Coordinate',
                location
            }
        });
    }

    handleSearchClear() {
        this.setState({locationMarker: {show: false}});
    }

    handleViewChange(view) {
        this.setState({view});
    }

    handleLongViewChange(view) {
        this.setState({view});
    }

    render() {
        let zoomLevel = Math.round(this.state.view.zoom);
        let scale = Math.pow(2, this.state.view.zoom - zoomLevel);
        let view = VectorUtil.multiply(this.state.view, Math.pow(2, zoomLevel - Math.floor(this.state.view.zoom)));

        return <span>
            <TopBar onSearchSubmit={this.handleSearchSubmit}
                    onSearchClear={this.handleSearchClear}
                    onDrawClick={this.handleToggle}/>
            <MapViewController view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleLongViewChange} onLocationSelect={this.handleLocationSelect}>
                <MapView {...view} zoomLevel={zoomLevel} scale={scale}>
                    <MapTilesLayer/>
                    <MapLayer {...this.state.locationInformation.location}>
                        {this.state.locationMarker.show
                            ? <Picture source="images/marker-search.svg" left={-10} top={-30} width={20} height={30}/>
                            : null}
                    </MapLayer>
                    <MapLayer {...this.state.locationInformation.location} render="html">
                        <LocationInfoBox onClearClick={this.handleSearchClear}
                                         active={this.state.locationMarker.show}
                                         locationInformation={this.state.locationInformation}/>
                    </MapLayer>
                </MapView>
            </MapViewController>
        </span>;
    }
};
