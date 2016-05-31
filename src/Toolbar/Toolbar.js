import React from 'react';
import style from './style';
import classNames from 'classnames';
import {Button, IconButton} from 'react-toolbox';
import {EyeActive, EyeInactive} from '../Icons';
import LocationSearch from './LocationSearch';
import LocalStorageComponent from '../LocalStorageComponent';
import EventUtil from '../EventUtil';
import {MapToolbarItem} from './TempToolbarItems';

import {MapActive} from '../Icons';

export default class Toolbar extends LocalStorageComponent {
    constructor() {
        super();
        this.componentWillMount = this.componentWillMount.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handlePinClick = this.handlePinClick.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this);
    }

    static propTypes = {
        onSearchSubmit: React.PropTypes.func,
        onSearchClear: React.PropTypes.func
    };

    state = {
        pinned: false,
        expanded: false
    };

    componentWillMount() {
        this.setPersistenceKey('toolbar');
        this.setStateMapping(state => ({pinned: state.pinned}));
        this.restoreState();
    }

    componentDidMount() {
        if (this.state.expanded) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.expanded && !prevState.expanded) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        } else if (!this.state.expanded && prevState.expanded) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentWillUnmount() {
        if (this.state.expanded) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    handleDocumentClick(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.toolbarMenuToggle) && !EventUtil.targetIsDescendant(event, this.refs.toolbarItemsContainer)) {
            this.setState({expanded: false});
        }
    }

    handlePinClick() {
        this.setState({pinned: !this.state.pinned});
    }

    handleMenuClick() {
        this.setState({expanded: !this.state.expanded});
    }

    render() {
        return <div className={classNames(style['toolbar-hover-container'], {[style['pinned']]: this.state.pinned})}>
            <div className={style['toolbar']}>
                <IconButton className={style['toolbar-item']} onClick={this.handlePinClick}>
                    <img className={style['svg-icon']} src={this.state.pinned ? EyeActive : EyeInactive}/>
                </IconButton>
                <LocationSearch className={style['toolbar-item']} onSubmit={this.props.onSearchSubmit} onClear={this.props.onSearchClear}/>
                <div ref="toolbarMenuToggle" className={classNames(style['toolbar-item'], style['toolbar-menu-toggle'])}>
                    <IconButton icon="menu" onClick={this.handleMenuClick}/>
                </div>
                <div ref="toolbarItemsContainer" className={classNames(style['toolbar-item'], style['toolbar-menu-container'], {[style['active']]: this.state.expanded})}>
                    <MapToolbarItem/>
                </div>
            </div>
        </div>;
    }
};
