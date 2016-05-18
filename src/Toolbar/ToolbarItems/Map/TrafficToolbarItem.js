import React from 'react';
import TrafficContext from './TrafficContext';
import ToolbarItem from '../ToolbarItem';
import TrafficInactive from '../../../../public/images/traffic-inactive.svg';
import style from './style';

export default class TrafficToolbarItem extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
    }

    static propTypes = {
        traffic: React.PropTypes.object.isRequired,
        onTrafficChange: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        onTrafficChange: () => {
        }
    };

    shouldComponentUpdate(prevProps) {
        return this.props.traffic != prevProps.traffic
            || this.props.onTrafficChange != prevProps.onTrafficChange;
    }

    render() {
        return <ToolbarItem
            icon={<TrafficInactive viewBox="0 0 30 30"/>}
            label="Traffic"
            className={style['toolbar-item']}
            buttonClassName={style['toolbar-button']}
            cardClassName={style['toolbar-context-container']}
        >
            <TrafficContext traffic={this.props.traffic} onTrafficChange={this.props.onTrafficChange}/>
        </ToolbarItem>;
    }
};
