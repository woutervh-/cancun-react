import React from 'react';
import style from './style';
import classNames from 'classnames';
import {IconButton} from 'react-toolbox';
import {EyeActive, EyeInactive} from '../Icons';
import LocationSearch from './LocationSearch';

export default class Toolbar extends React.Component {
    constructor() {
        super();
        this.handlePinClick = this.handlePinClick.bind(this);
    }

    static propTypes = {
        onSearchSubmit: React.PropTypes.func,
        onSearchClear: React.PropTypes.func
    };

    state = {
        pinned: true
    };

    handlePinClick() {
        this.setState({pinned: !this.state.pinned});
    }

    render() {
        return <div className={classNames(style['toolbar-hover-container'], {[style['pinned']]: this.state.pinned})}>
            <div className={style['toolbar']}>
                <IconButton className={style['toolbar-item']} onClick={this.handlePinClick}>
                    <img className={style['svg-icon']} src={this.state.pinned ? EyeActive : EyeInactive}/>
                </IconButton>
                <LocationSearch className={style['toolbar-item']} onSubmit={this.props.onSearchSubmit} onClear={this.props.onSearchClear}/>
            </div>
        </div>;
    }
};
