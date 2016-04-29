import TopBar from './TopBar';
import BottomBar from './BottomBar';
import {MapHelper, MapLayer, MapView, MapViewController} from './map';
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
        searchMarker: {
            show: false
        },
        searchInformation: {
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
                searchMarker: {
                    show: true
                },
                searchInformation: {
                    name: input.isCoordinate ? 'Coordinate' : input.location,
                    location: {
                        latitude: input.latitude,
                        longitude: input.longitude
                    }
                }
            });
        }
    }

    handleLocationSelect(location) {
        this.setState({
            searchMarker: {
                show: true
            },
            searchInformation: {
                name: 'Coordinate',
                location
            }
        });
    }

    handleSearchClear() {
        this.setState({searchMarker: {show: false}});
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
                    {this.state.searchMarker.show ?
                        <MapLayer {...this.state.searchInformation.location}>
                            <Picture source="images/marker-search.svg" left={-10} top={-30} width={20} height={30}/>
                        </MapLayer>
                        : null }
                </MapView>
            </MapViewController>
            <BottomBar onClearClick={this.handleSearchClear} active={this.state.searchMarker.show} searchInformation={this.state.searchInformation}/>
        </span>;
    }
};
