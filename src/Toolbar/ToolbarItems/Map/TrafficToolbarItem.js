import React from 'react';
import TrafficContext from './TrafficContext';
import ToolbarItem from '../ToolbarItem';
import TrafficActive from '../../../../public/images/traffic-active.svg';
import TrafficInactive from '../../../../public/images/traffic-inactive.svg';
import style from './style';

export default class TrafficToolbarItem extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
    }

    static propTypes = {
        show: React.PropTypes.bool.isRequired,
        active: React.PropTypes.bool.isRequired,
        onToggleShow: React.PropTypes.func.isRequired,
        onToggleActive: React.PropTypes.func.isRequired,
        traffic: React.PropTypes.object.isRequired,
        onTrafficChange: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        show: false,
        onToggleShow: () => {
        },
        onTrafficChange: () => {
        }
    };

    shouldComponentUpdate(prevProps) {
        return this.props.show != prevProps.show
            || this.props.active != prevProps.active
            || this.props.onToggleShow != prevProps.onToggleShow
            || this.props.onToggleActive != prevProps.onToggleActive
            || this.props.traffic != prevProps.traffic
            || this.props.onTrafficChange != prevProps.onTrafficChange;
    }

    render() {
        return <ToolbarItem
            show={this.props.show}
            active={this.props.active}
            onToggleShow={this.props.onToggleShow}
            onToggleActive={this.props.onToggleActive}
            icon={this.props.active
                            ? <TrafficActive viewBox="0 0 30 30"/>
                            : <TrafficInactive viewBox="0 0 30 30"/>}
            label="Traffic"
            className={style['toolbar-item']}
            buttonClassName={style['toolbar-button']}
            cardClassName={style['toolbar-context-container']}
        >
            <TrafficContext traffic={this.props.traffic} onTrafficChange={this.props.onTrafficChange}/>
        </ToolbarItem>;
    }
};
