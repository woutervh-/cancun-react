import React from 'react';
import style from './style';
import shallowEqual from 'shallowequal';
import EventUtil from '../../EventUtil';
import classNames from 'classnames';

export default class Marker extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.activate = this.activate.bind(this);
        this.deactivate = this.deactivate.bind(this);
    }

    static propTypes = {
        position: React.PropTypes.shape({
            latitude: React.PropTypes.number.isRequired,
            longitude: React.PropTypes.number.isRequired
        }).isRequired,
        offset: React.PropTypes.shape({
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired
        }),
        icon: React.PropTypes.any
    };

    state = {
        active: false
    };

    shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
    }

    componentDidMount() {
        if (this.state.active) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.active && !prevState.active) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        } else if (!this.state.active && prevState.active) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentWillUnmount() {
        if (this.state.active) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    handleDocumentClick(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            this.setState({active: false});
        }
    }

    activate() {
        this.setState({active: true});
    }

    deactivate() {
        this.setState({active: false});
    }

    render() {
        let {position, offset, icon, children, ...other} = this.props;
        return <div ref="container" style={{position: 'absolute', top: offset.y, left: offset.x}} {...other}>
            {icon}
            <div className={classNames(style['popup'], {[style['active']]: this.state.active})}>
                {children}
            </div>
        </div>;
    }
};
