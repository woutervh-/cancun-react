import {AppBar, IconMenu, MenuDivider, MenuItem} from 'react-toolbox';
import MapHelper from './map/MapHelper';
import MapViewController from './map/MapViewController';
import React from 'react';
import SearchBar from './SearchBar';
import style from './style';

export default class TopBar extends React.Component {
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
        return nextProps.onSearchSubmit != this.props.onSearchSubmit
            || nextProps.onSearchClear != this.props.onSearchClear;
    }

    render() {
        return <div className={style['top-bar-hover-container']}>
            <AppBar className={style['top-bar']}>
                <IconMenu icon='menu' position='top-left'>
                    <MenuItem caption='+' onClick={this.props.onPlusClick}/>
                    <MenuItem caption='-' onClick={this.props.onMinusClick}/>
                    <MenuDivider />
                    <MenuItem caption='Drawer' onClick={this.props.onDrawClick}/>
                </IconMenu>
                <SearchBar onSubmit={this.props.onSearchSubmit} onClear={this.props.onSearchClear}/>
            </AppBar>
        </div>;
    }
};
