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
        let zoomLevel = Math.round(this.state.view.zoom);
        let scale = Math.pow(2, this.state.view.zoom - zoomLevel);
        let view = VectorUtil.multiply(this.state.view, Math.pow(2, zoomLevel - Math.floor(this.state.view.zoom)));

        return <span>
            <AppBarWrapper onSearchSubmit={this.handleSearchSubmit}
                           onPlusClick={() => this.setState({view: {x: this.state.view.x, y:this.state.view.y, zoom: this.state.view.zoom+0.25}})}
                           onMinusClick={() => this.setState({view: {x: this.state.view.x, y:this.state.view.y, zoom: this.state.view.zoom-0.25}})}/>
            <MapViewController view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleLongViewChange}>
                <MapView {...view} zoomLevel={zoomLevel} scale={scale}>
                    <MapLayer latitude={52.373166} longitude={4.89066}>
                        <Picture source="images/marker-search.svg" left={-10} top={-30} width={20} height={30}/>
                    </MapLayer>
                </MapView>
            </MapViewController>
        </span>;
    }
};
