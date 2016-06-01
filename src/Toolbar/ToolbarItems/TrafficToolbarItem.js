import React from 'react';
import {Checkbox, MenuDivider, RadioButton, RadioGroup} from 'react-toolbox';
import style from './style';
import ToolbarItem from './ToolbarItem';
import {TrafficActive, TrafficInactive} from '../../Icons';
import shallowEqual from 'shallowequal';

export default class MapToolbarItem extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.renderIcon = this.renderIcon.bind(this);
        this.handleActiveChange = this.handleActiveChange.bind(this);
        this.handleTubesChange = this.handleTubesChange.bind(this);
        this.handleIconsChange = this.handleIconsChange.bind(this);
        this.handleStyleSelect = this.handleStyleSelect.bind(this);
    }

    static propTypes = {
        context: React.PropTypes.object.isRequired,
        onContextChange: React.PropTypes.func.isRequired
    };

    shouldComponentUpdate(nextProps) {
        return !shallowEqual(this.props, nextProps);
    }

    renderIcon() {
        return <img src={this.props.context.show ? TrafficActive : TrafficInactive} className={style['svg-icon']}/>
    }

    handleActiveChange(value) {
        this.props.onContextChange({...this.props.context, show: value});
    }

    handleTubesChange(value) {
        this.props.onContextChange({...this.props.context, showTubes: value});
    }

    handleIconsChange(value) {
        this.props.onContextChange({...this.props.context, showIcons: value});
    }

    handleStyleSelect(value) {
        this.props.onContextChange({...this.props.context, flow: value});
    }

    render() {
        return <ToolbarItem icon={this.renderIcon()} active={this.props.context.show} canActivate={true} onActiveChange={this.handleActiveChange} label="Traffic">
            <Checkbox className={style['checkbox']} checked={this.props.context.showTubes} label="Traffic tubes" onChange={this.handleTubesChange}/>
            <Checkbox className={style['checkbox']} checked={this.props.context.showIcons} label="Traffic icons" onChange={this.handleIconsChange}/>
            <MenuDivider/>
            <RadioGroup name="flow" value={this.props.context.flow} onChange={this.handleStyleSelect}>
                <RadioButton className={style['radio-button']} label="None" value="none"/>
                <RadioButton className={style['radio-button']} label="Absolute" value="absolute"/>
                <RadioButton className={style['radio-button']} label="Relative" value="relative"/>
            </RadioGroup>
        </ToolbarItem>;
    }
};
