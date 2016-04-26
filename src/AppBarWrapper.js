import {AppBar, IconMenu, MenuDivider, MenuItem} from 'react-toolbox';
import MapHelper from './map/MapHelper';
import MapViewController from './map/MapViewController';
import React from 'react';
import SearchBar from './SearchBar';
import style from './style';

export default class AppBarWrapper extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
    }

    static propTypes = {
        onSearchSubmit: React.PropTypes.func.isRequired,
        onSearchClear: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        onSearchSubmit: () => {
        },
        onSearchClear: () => {
        }
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.onSearchSubmit !== this.props.onSearchSubmit;
    }

    render() {
        return <AppBar className={style['top-bar']}>
            <IconMenu icon='menu' position='top-left'>
                <MenuItem caption='+' onClick={this.props.onPlusClick}/>
                <MenuItem caption='-' onClick={this.props.onMinusClick}/>
                <MenuDivider />
                <MenuItem value='help' caption='Favorite'/>
            </IconMenu>
            <SearchBar onSubmit={this.props.onSearchSubmit} onClear={this.props.onSearchClear}/>
        </AppBar>;
    }
};
