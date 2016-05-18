import React from 'react';
import {Checkbox, Switch} from 'react-toolbox';
import style from './style';

export default class TrafficContext extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.handleTubesChange = this.handleTubesChange.bind(this);
        this.handleIconsChange = this.handleIconsChange.bind(this);
        this.handleShowChange = this.handleShowChange.bind(this);
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

    render() {
        return <div>
            <Switch checked={this.props.traffic.show} label="Show traffic" onChange={this.handleShowChange}/>
            <Checkbox className={style['checkbox']} checked={this.props.traffic.showTubes} label="Traffic tubes" onChange={this.handleTubesChange}/>
            <Checkbox className={style['checkbox']} checked={this.props.traffic.showIcons} label="Traffic icons" onChange={this.handleIconsChange}/>
        </div>;
    }
};
