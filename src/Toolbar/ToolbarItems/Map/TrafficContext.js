import React from 'react';
import {Checkbox, MenuDivider, RadioGroup, RadioButton, Switch} from 'react-toolbox';
import style from './style';
import {FlowHelper} from '../../../Map';

export default class TrafficContext extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.handleTubesChange = this.handleTubesChange.bind(this);
        this.handleIconsChange = this.handleIconsChange.bind(this);
        this.handleShowChange = this.handleShowChange.bind(this);
        this.handleStyleSelect = this.handleStyleSelect.bind(this);
    }

    static propTypes = {
        traffic: React.PropTypes.object.isRequired,
        onTrafficChange: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        onTrafficChange: () => {
        }
    };

    shouldComponentUpdate(nextProps) {
        return this.props.traffic != nextProps.traffic
            || this.props.onTrafficChange != nextProps.onTrafficChange;
    }

    handleTubesChange(value) {
        this.props.onTrafficChange({showTubes: value});
    }

    handleIconsChange(value) {
        this.props.onTrafficChange({showIcons: value});
    }

    handleShowChange(value) {
        this.props.onTrafficChange({show: value});
    }

    handleStyleSelect(value) {
        if (value == 'none') {
            this.props.onTrafficChange({showFlow: false});
        } else {
            this.props.onTrafficChange({showFlow: true, flowStyle: value});
        }
    }

    render() {
        return <div>
            <Switch className={style['switch']} checked={this.props.traffic.show} label="Show traffic" onChange={this.handleShowChange}/>
            <MenuDivider/>
            <Checkbox className={style['checkbox']} checked={this.props.traffic.showTubes} label="Traffic tubes" onChange={this.handleTubesChange}/>
            <Checkbox className={style['checkbox']} checked={this.props.traffic.showIcons} label="Traffic icons" onChange={this.handleIconsChange}/>
            <MenuDivider/>
            <RadioGroup name="flow" value={this.props.traffic.showFlow ? this.props.traffic.flowStyle : 'none'} onChange={this.handleStyleSelect}>
                <RadioButton className={style['radio-button']} label="None" value="none"/>
                {FlowHelper.styles.map((option, index) => <RadioButton key={index} className={style['radio-button']} label={option.label} value={option.value}/>)}
            </RadioGroup>
        </div>;
    }
};
