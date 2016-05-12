import {Card, CardText, CardActions, IconButton, Navigation, RadioGroup, RadioButton} from 'react-toolbox';
import MapHelper from './../Map/MapHelper';
import React from 'react';
import SearchBar from '../SearchBar';
import style from './style';
import classNames from 'classnames';
import EyeActive from '../../public/images/eye-active';
import EyeInactive from '../../public/images/eye-inactive';
import MapInactive from '../../public/images/map-inactive';
import LocalStorageComponent from '../LocalStorageComponent';
import MapSelect from './MapSelect';
import ToolbarItem from './ToolbarItem';
import EventUtil from '../EventUtil';

export default class TopBar extends LocalStorageComponent {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.handlePinClick = this.handlePinClick.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
    }

    static propTypes = {
        mapStyle: React.PropTypes.string.isRequired,
        onSearchSubmit: React.PropTypes.func.isRequired,
        onSearchClear: React.PropTypes.func.isRequired,
        onMapSelect: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        onSearchSubmit: () => {
        },
        onSearchClear: () => {
        },
        onMapSelect: ()=> {
        }
    };

    state = {
        pinned: false,
        toolbarActive: false
    };

    componentDidMount() {
        this.setPersistenceKey('top-bar');
        this.restoreState();
        if (this.state.toolbarActive) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.toolbarActive && !prevState.toolbarActive) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        } else if (!this.state.toolbarActive && prevState.toolbarActive) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentWillUnmount() {
        if (this.state.toolbarActive) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.mapStyle != this.props.mapStyle
            || nextProps.onSearchSubmit != this.props.onSearchSubmit
            || nextProps.onSearchClear != this.props.onSearchClear
            || nextProps.onMapSelect != this.props.onMapSelect
            || nextState.pinned != this.state.pinned
            || nextState.toolbarActive != this.state.toolbarActive;
    }

    handlePinClick() {
        this.setState({pinned: !this.state.pinned});
    }

    handleMenuClick() {
        this.setState({toolbarActive: !this.state.toolbarActive});
    }

    handleDocumentClick(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.toolbarContainer) && !EventUtil.targetIsDescendant(event, this.refs.toolbarToggleContainer)) {
            this.setState({toolbarActive: false});
        }
    }

    render() {
        return <div className={classNames(style['top-bar-hover-container'], {[style['pinned']]: this.state.pinned})}>
            <div className={style['top-bar']}>
                <IconButton onClick={this.handlePinClick}>
                    {this.state.pinned
                        ? <EyeActive viewBox="0 0 30 30"/>
                        : <EyeInactive viewBox="0 0 30 30"/>}
                </IconButton>
                <SearchBar onSubmit={this.props.onSearchSubmit} onClear={this.props.onSearchClear}/>
                <div ref="toolbarToggleContainer">
                    <IconButton icon="menu" onClick={this.handleMenuClick} className={style['toggle-side-bar-button']}/>
                </div>
                <div ref="toolbarContainer" className={classNames(style['toolbar-container'], {[style['active']]: this.state.toolbarActive})}>
                    <ToolbarItem icon={<MapInactive viewBox="0 0 30 30"/>} label="Map" className={style['toolbar-item']}>
                        <MapSelect selected={this.props.mapStyle} options={MapHelper.styles} onMapSelect={this.props.onMapSelect}/>
                    </ToolbarItem>
                </div>
            </div>
        </div>;
    }
};
