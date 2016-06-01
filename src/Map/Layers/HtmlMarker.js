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
        this.show = this.show.bind(this);
        this.hide= this.hide.bind(this);
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
        show: false
    };

    shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
    }

    componentDidMount() {
        if (this.state.show) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.show && !prevState.show) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        } else if (!this.state.show && prevState.show) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentWillUnmount() {
        if (this.state.show) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    handleDocumentClick(event) {
        if (!EventUtil.targetIsDescendant(event, this.refs.container)) {
            this.setState({show: false});
        }
    }

    show() {
        this.setState({show: true});
    }

    hide() {
        this.setState({show: false});
    }

    render() {
        let {position, offset, icon, children, ...other} = this.props;
        return <div ref="container" style={{position: 'absolute', top: offset.y, left: offset.x}} {...other}>
            {icon}
            <div className={classNames(style['popup'], {[style['active']]: this.state.show})}>
                {children}
            </div>
        </div>;
    }
};
