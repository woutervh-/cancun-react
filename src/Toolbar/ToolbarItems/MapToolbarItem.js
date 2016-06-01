import React from 'react';
import {RadioButton, RadioGroup} from 'react-toolbox';
import style from './style';
import ToolbarItem from './ToolbarItem';
import {MapInactive} from '../../Icons';
import shallowEqual from 'shallowequal';

export default class MapToolbarItem extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.handleMapSelect = this.handleMapSelect.bind(this);
        this.renderIcon = this.renderIcon.bind(this);
    }

    static propTypes = {
        context: React.PropTypes.object.isRequired,
        onContextChange: React.PropTypes.func.isRequired
    };

    shouldComponentUpdate(nextProps) {
        return !shallowEqual(this.props, nextProps);
    }

    handleMapSelect(value) {
        this.props.onContextChange({style: value});
    }

    renderIcon() {
        return <img src={MapInactive} className={style['svg-icon']}/>
    }

    render() {
        return <ToolbarItem icon={this.renderIcon()} label="Map">
            <RadioGroup name="map" value={this.props.context.style} onChange={this.handleMapSelect}>
                <RadioButton className={style['radio-button']} label="Day" value="1"/>
                <RadioButton className={style['radio-button']} label="Night" value="night"/>
            </RadioGroup>
        </ToolbarItem>;
    }
};
