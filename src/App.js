import AppBarWrapper from './AppBarWrapper';
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
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLongViewChange = this.handleLongViewChange.bind(this);
    }

    state = {
        view: {
            x: 0,
            y: 0,
            zoom: 0
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
                }
            });
        }
    }

    handleViewChange(view) {
        this.setState({view});
    }

    handleLongViewChange(view) {
        this.setState({view});
    }

    render() {
        return <span>
            <AppBarWrapper onSearchSubmit={this.handleSearchSubmit}/>
            <MapViewController view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleLongViewChange}>
                <MapView x={this.state.view.x}
                         y={this.state.view.y}
                         zoomLevel={Math.floor(this.state.view.zoom)}
                         scale={1 + this.state.view.zoom - Math.floor(this.state.view.zoom)}>
                    <MapLayer latitude={52.315871} longitude={4.953673}>
                        <Picture source="images/marker-search.svg" left={150} top={150} width={20} height={30}/>
                    </MapLayer>
                </MapView>
            </MapViewController>
        </span>;
    }
};
