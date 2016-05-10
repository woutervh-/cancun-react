import {Card, CardText, CardActions, IconButton, Navigation, RadioGroup, RadioButton} from 'react-toolbox';
import MapHelper from './map/MapHelper';
import MapViewController from './map/MapViewController';
import React from 'react';
import SearchBar from './SearchBar';
import style from './style';
import classNames from 'classnames';
import EyeActive from '../public/images/eye-active';
import EyeInactive from '../public/images/eye-inactive';
import MapActive from '../public/images/map-active';
import MapInactive from '../public/images/map-inactive';
import LocalStorageComponent from './LocalStorageComponent';

export default class TopBar extends LocalStorageComponent {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.handlePinClick = this.handlePinClick.bind(this);
        this.handleMapSelect = this.handleMapSelect.bind(this);
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

    state = {
        pinned: false,
        map: 'day'
    };

    componentDidMount() {
        this.setPersistenceKey('top-bar');
        this.restoreState();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.onSearchSubmit != this.props.onSearchSubmit
            || nextProps.onSearchClear != this.props.onSearchClear
            || nextState.pinned != this.state.pinned
            || nextState.map != this.state.map;
    }

    handlePinClick() {
        this.setState({pinned: !this.state.pinned});
    }

    handleMapSelect(value) {
        this.setState({map: value});
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
                <Navigation>
                </Navigation>
            </div>
        </div>;
    }
};
