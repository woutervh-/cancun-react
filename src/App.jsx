import AppBarWrapper from './AppBarWrapper.jsx';
import MapHelper from './MapHelper.js';
import MapViewController from './MapViewController.jsx';
import React from 'react';
import SearchBar from './SearchBar.jsx';
import style from './style.scss';
import VectorUtil from './VectorUtil.js';

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
            this.setState({view: {
                x: center.x,
                y: center.y,
                zoom: toZoom
            }});
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
            <MapViewController view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleLongViewChange}/>
        </span>;
    }
};
