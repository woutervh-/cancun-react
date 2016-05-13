import React from 'react';
import {Checkbox} from 'react-toolbox';
import style from './style';

export default class TrafficContext extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.handleTubesChange = this.handleTubesChange.bind(this);
        this.handleIconsChange = this.handleIconsChange.bind(this);
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

    render() {
        return <div>
            <Checkbox className={style['checkbox']} checked={this.props.traffic.showTubes} label="Traffic tubes" onChange={this.handleTubesChange}/>
            <Checkbox className={style['checkbox']} checked={this.props.traffic.showIcons} label="Traffic icons" onChange={this.handleIconsChange}/>
        </div>;
    }
};
