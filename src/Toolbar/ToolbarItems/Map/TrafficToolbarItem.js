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
        this.handleToggle = this.handleToggle.bind(this);
    }

    static propTypes = {
    };

    static defaultProps = {
    };

    state = {
        active: false
    };

    shouldComponentUpdate(prevProps, prevState) {
        return this.state.active != prevState.active;
    }

    handleToggle(active) {
        this.setState({active});
    }

    render() {
        return <ToolbarItem
            active={this.state.active}
            onToggle={this.handleToggle}
            icon={this.state.active
                            ? <TrafficActive viewBox="0 0 30 30"/>
                            : <TrafficInactive viewBox="0 0 30 30"/>}
            label="Traffic"
            className={style['toolbar-item']}
            buttonClassName={style['toolbar-button']}
            cardClassName={style['toolbar-context-container']}
        >
            <TrafficContext/>
        </ToolbarItem>;
    }
};
