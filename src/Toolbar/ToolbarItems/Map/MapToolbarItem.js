import React from 'react';
import MapContext from './MapContext';
import ToolbarItem from '../ToolbarItem';
import {MapHelper} from '../../../Map';
import MapActive from '../../../../public/images/map-active.svg';
import MapInactive from '../../../../public/images/map-inactive.svg';
import style from './style';

export default class MapToolbarItem extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    static propTypes = {
        mapStyle: React.PropTypes.string.isRequired,
        onMapSelect: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        onMapSelect: () => {
        }
    };

    state = {
        active: false
    };

    shouldComponentUpdate(prevProps, prevState) {
        return this.props.mapStyle != prevProps.mapStyle
            || this.props.onMapSelect != prevProps.onMapSelect
            || this.state.active != prevState.active;
    }

    handleToggle(active) {
        this.setState({active});
    }

    render() {
        return <ToolbarItem
            active={this.state.active}
            onToggle={this.handleToggle}
            icon={this.state.active
                            ? <MapActive viewBox="0 0 30 30"/>
                            : <MapInactive viewBox="0 0 30 30"/>}
            label="Map"
            className={style['toolbar-item']}
            buttonClassName={style['toolbar-button']}
            cardClassName={style['toolbar-context-container']}
        >
            <MapContext selected={this.props.mapStyle} options={MapHelper.styles} onMapSelect={this.props.onMapSelect}/>
        </ToolbarItem>;
    }
};
