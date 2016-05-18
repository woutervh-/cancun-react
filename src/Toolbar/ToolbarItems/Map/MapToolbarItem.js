import React from 'react';
import MapContext from './MapContext';
import ToolbarItem from '../ToolbarItem';
import {MapHelper} from '../../../Map';
import MapInactive from '../../../../public/images/map-inactive.svg';
import style from './style';

export default class MapToolbarItem extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
    }

    static propTypes = {
        mapStyle: React.PropTypes.string.isRequired,
        onMapSelect: React.PropTypes.func.isRequired,
        show: React.PropTypes.bool.isRequired,
        onToggleShow: React.PropTypes.func.isRequired,
        onMouseOver: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        onMapSelect: () => {
        },
        show: false,
        onToggleShow: ()=> {
        },
        onMouseOver: ()=> {
        }
    };

    shouldComponentUpdate(prevProps) {
        return this.props.mapStyle != prevProps.mapStyle
            || this.props.onMapSelect != prevProps.onMapSelect
            || this.props.show != prevProps.show
            || this.props.onToggleShow != prevProps.onToggleShow
            || this.props.onMouseOver != prevProps.onMouseOver;
    }

    render() {
        return <ToolbarItem
            icon={<MapInactive viewBox="0 0 30 30"/>}
            label="Map"
            show={this.props.show}
            onToggleShow={this.props.onToggleShow}
            onMouseOver={this.props.onMouseOver}
            className={style['toolbar-item']}
            buttonClassName={style['toolbar-button']}
            cardClassName={style['toolbar-context-container']}
        >
            <MapContext selected={this.props.mapStyle} onMapSelect={this.props.onMapSelect}/>
        </ToolbarItem>;
    }
};
