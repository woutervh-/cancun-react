import {AppBar, IconMenu, Layout, MenuDivider, MenuItem, Panel} from 'react-toolbox';
import MapView from './MapView.jsx';
import React from 'react';
import SearchBar from './SearchBar.jsx';
import style from './style.scss';

export default class App extends React.Component {
    constructor() {
        super();
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    }

    state = {
        searchText: '',
        searchDataSource: []
    };

    handleSearchSubmit(input) {
        if (!!input) {
            console.log('submitted:');
            console.log(input);
        }
    }

    render() {
        return <span>
            <MapView/>
            <AppBar className={style['top-bar']}>
                <IconMenu icon='menu' position='top-left'>
                    <MenuItem value='download' caption='Download'/>
                    <MenuDivider />
                    <MenuItem value='help' caption='Favorite'/>
                    <MenuItem value='settings' caption='Open in app'/>
                </IconMenu>
                <SearchBar onSubmit={this.handleSearchSubmit}/>
            </AppBar>
        </span>;

        //return <div className={style['wrapper']}>
        //    <div className={style['content']}>
        //        <MapView/>
        //    </div>
        //    <AppBar className={style['top-bar']}>
        //        <IconMenu icon='menu' position='top-left'>
        //            <MenuItem value='download' caption='Download'/>
        //            <MenuDivider />
        //            <MenuItem value='help' caption='Favorite'/>
        //            <MenuItem value='settings' caption='Open in app'/>
        //        </IconMenu>
        //        <SearchBar onSubmit={this.handleSearchSubmit}/>
        //    </AppBar>
        //</div>;
    }
};
