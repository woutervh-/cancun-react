import {AppBar, IconMenu, Layout, MenuDivider, MenuItem, Panel} from 'react-toolbox';
import MapHelper from '../lib/MapHelper.js';
import MapView from './MapView.jsx';
import MapViewContainer from './MapViewContainer.jsx';
import MathUtil from '../lib/MathUtil.js';
import React from 'react';
import SearchBar from './SearchBar.jsx';
import style from './style.scss';

export default class App extends React.Component {
    constructor() {
        super();
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
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
            console.log('submitted:');
            console.log(input);
        }
    }

    handleViewChange(view) {
        this.setState({view});
    }

    render() {
        return <span>
            <AppBar className={style['top-bar']}>
                <IconMenu icon='menu' position='top-left'>
                    <MenuItem caption='+'/>
                    <MenuItem caption='-'/>
                    <MenuDivider />
                    <MenuItem value='help' caption='Favorite'/>
                </IconMenu>
                <SearchBar onSubmit={this.handleSearchSubmit}/>
            </AppBar>
            <MapViewContainer view={this.state.view} onViewChange={this.handleViewChange}/>
        </span>;
    }
};
