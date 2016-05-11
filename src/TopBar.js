import {Card, CardText, CardActions, IconButton, Navigation, RadioGroup, RadioButton} from 'react-toolbox';
import MapHelper from './map/MapHelper';
import MapViewController from './map/MapViewController';
import React from 'react';
import SearchBar from './SearchBar';
import style from './style';
import classNames from 'classnames';
import EyeActive from '../public/images/eye-active';
import EyeInactive from '../public/images/eye-inactive';
import MapInactive from '../public/images/map-inactive';
import LocalStorageComponent from './LocalStorageComponent';
import {MapSelect, ToolbarItem} from './Toolbar';

export default class TopBar extends LocalStorageComponent {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.handlePinClick = this.handlePinClick.bind(this);
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
        pinned: false
    };

    componentDidMount() {
        this.setPersistenceKey('top-bar');
        this.restoreState();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.mapStyle != this.props.mapStyle
            || nextProps.onSearchSubmit != this.props.onSearchSubmit
            || nextProps.onSearchClear != this.props.onSearchClear
            || nextProps.onMapSelect != this.props.onMapSelect
            || nextState.pinned != this.state.pinned
    }

    handlePinClick() {
        this.setState({pinned: !this.state.pinned});
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
                <ToolbarItem icon={<MapInactive viewBox="0 0 30 30"/>} label="Map">
                    <MapSelect selected={this.props.mapStyle} options={MapHelper.styles} onMapSelect={this.props.onMapSelect}/>
                </ToolbarItem>
            </div>
        </div>;
    }
};
