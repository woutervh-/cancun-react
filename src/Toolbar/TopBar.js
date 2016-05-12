import {IconButton} from 'react-toolbox';
import MapHelper from '../Map/MapHelper';
import React from 'react';
import SearchBar from '../SearchBar';
import style from './style';
import classNames from 'classnames';
import EyeActive from '../../public/images/eye-active';
import EyeInactive from '../../public/images/eye-inactive';
import LocalStorageComponent from '../LocalStorageComponent';
import EventUtil from '../EventUtil';
import {MapToolbarItem, TrafficToolbarItem} from './ToolbarItems/Map';

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
        this.handleMapToggleShow = this.handleMapToggleShow.bind(this);
        this.handleTrafficToggleShow = this.handleTrafficToggleShow.bind(this);
    }

    static propTypes = {
        mapStyle: React.PropTypes.string.isRequired,
        traffic: React.PropTypes.object.isRequired,
        onSearchSubmit: React.PropTypes.func.isRequired,
        onSearchClear: React.PropTypes.func.isRequired,
        onMapSelect: React.PropTypes.func.isRequired,
        onTrafficChange: React.PropTypes.func.isRequired,
        onTrafficToggle: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        onSearchSubmit: () => {
        },
        onSearchClear: () => {
        },
        onMapSelect: ()=> {
        },
        onTrafficChange: () => {
        },
        onTrafficToggle: () => {
        }
    };

    state = {
        pinned: false,
        toolbarActive: false,
        toolbarItem: ''
    };

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.mapStyle != this.props.mapStyle
            || nextProps.traffic != this.props.traffic
            || nextProps.onSearchSubmit != this.props.onSearchSubmit
            || nextProps.onSearchClear != this.props.onSearchClear
            || nextProps.onMapSelect != this.props.onMapSelect
            || nextProps.onTrafficChange != this.props.onTrafficChange
            || nextProps.onTrafficToggle != this.props.onTrafficToggle
            || nextState.pinned != this.state.pinned
            || nextState.toolbarActive != this.state.toolbarActive
            || nextState.toolbarItem != this.state.toolbarItem;
    }

    componentDidMount() {
        this.setPersistenceKey('top-bar');
        this.setStateMapping(state => ({pinned: state.pinned}));
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

    handleMapToggleShow(show) {
        if (show) {
            this.setState({toolbarItem: 'map'});
        } else if (this.state.toolbarItem == 'map') {
            this.setState({toolbarItem: ''});
        }
    }

    handleTrafficToggleShow(show) {
        if (show) {
            this.setState({toolbarItem: 'traffic'});
        } else if (this.state.toolbarItem == 'traffic') {
            this.setState({toolbarItem: ''});
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
                    <MapToolbarItem show={this.state.toolbarItem == 'map'} onToggleShow={this.handleMapToggleShow} mapStyle={this.props.mapStyle} onMapSelect={this.props.onMapSelect}/>
                    <TrafficToolbarItem show={this.state.toolbarItem == 'traffic'} onToggleShow={this.handleTrafficToggleShow} active={this.props.traffic.show} traffic={this.props.traffic} onTrafficChange={this.props.onTrafficChange} onToggleActive={this.props.onTrafficToggle}/>
                </div>
            </div>
        </div>;
    }
};
