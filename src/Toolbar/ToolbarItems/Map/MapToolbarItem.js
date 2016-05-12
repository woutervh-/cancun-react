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
    }

    static propTypes = {
        show: React.PropTypes.bool.isRequired,
        onToggleShow: React.PropTypes.func.isRequired,
        mapStyle: React.PropTypes.string.isRequired,
        onMapSelect: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        show: false,
        onToggleShow: () => {
        },
        onMapSelect: () => {
        }
    };

    shouldComponentUpdate(prevProps) {
        return this.props.show != prevProps.show
            || this.props.onToggleShow != prevProps.onToggleShow
            || this.props.mapStyle != prevProps.mapStyle
            || this.props.onMapSelect != prevProps.onMapSelect;
    }

    render() {
        return <ToolbarItem
            show={this.props.show}
            active={false}
            onToggleShow={this.props.onToggleShow}
            icon={<MapInactive viewBox="0 0 30 30"/>}
            label="Map"
            className={style['toolbar-item']}
            buttonClassName={style['toolbar-button']}
            cardClassName={style['toolbar-context-container']}
        >
            <MapContext selected={this.props.mapStyle} onMapSelect={this.props.onMapSelect}/>
        </ToolbarItem>;
    }
};
