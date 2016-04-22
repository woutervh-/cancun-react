import {AppBar, IconMenu, Layout, MenuDivider, MenuItem, Panel} from 'react-toolbox';
import MapHelper from './MapHelper.js';
import MapViewController from './MapViewController.jsx';
import React from 'react';
import SearchBar from './SearchBar.jsx';
import style from './style.scss';

export default class AppBarWrapper extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
    }

    static propTypes = {
        onSearchSubmit: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        onSearchSubmit: () => {
        }
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.onSearchSubmit !== this.props.onSearchSubmit;
    }

    render() {
        return <AppBar className={style['top-bar']}>
            <IconMenu icon='menu' position='top-left'>
                <MenuItem caption='+'/>
                <MenuItem caption='-'/>
                <MenuDivider />
                <MenuItem value='help' caption='Favorite'/>
            </IconMenu>
            <SearchBar onSubmit={this.props.onSearchSubmit}/>
        </AppBar>;
    }
};
