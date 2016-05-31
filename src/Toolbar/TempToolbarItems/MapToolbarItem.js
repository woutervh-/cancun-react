import React from 'react';
import {RadioButton, RadioGroup, Switch} from 'react-toolbox';
import style from './style';
import ToolbarItem from './ToolbarItem';
import {MapActive, MapInactive} from '../../Icons';

export default class MapToolbarItem extends React.Component {
    constructor() {
        super();
        this.renderIcon = this.renderIcon.bind(this);
        this.handleMapSelect = this.handleMapSelect.bind(this);
    }

    state = {
        active: false,
        selected: 'a'
    };

    handleMapSelect(value) {
        this.setState({selected: value});
    }

    renderIcon() {
        return <img src={this.state.active ? MapActive : MapInactive} className={style['svg-icon']}/>
    }

    render() {
        return <ToolbarItem icon={this.renderIcon()} active={false} label="Map">
            <RadioGroup name="map" value={this.state.selected} onChange={this.handleMapSelect}>
                <RadioButton className={style['radio-button']} label="A" value="a"/>
                <RadioButton className={style['radio-button']} label="B" value="b"/>
            </RadioGroup>
        </ToolbarItem>;
    }
};
