import {AppBar, IconMenu, Layout, MenuDivider, MenuItem, Panel} from 'react-toolbox';
import MapHelper from './MapHelper.js';
import MapView from './MapView.jsx';
import MapViewContainer from './MapViewContainer.jsx';
import React from 'react';
import SearchBar from './SearchBar.jsx';
import style from './style.scss';

export default class App extends React.Component {
    constructor() {
        super();
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleLongViewChange = this.handleLongViewChange.bind(this);
    }

    state = {
        longView: {
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

    handleLongViewChange(view) {
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
            <MapViewContainer onLongViewChange={this.handleLongViewChange}/>
        </span>;
    }
};
