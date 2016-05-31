import {Button, Card, CardText} from 'react-toolbox';
import React from 'react';
import style from './style';
import classNames from 'classnames';
import EventUtil from '../../EventUtil';
import shallowEqual from 'shallowequal';
import Hammer from 'hammerjs';

export default class ToolbarItem extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
    }

    static propTypes = {
        canActivate: React.PropTypes.bool.isRequired,
        onActiveToggle: React.PropTypes.func.isRequired,
        active: React.PropTypes.bool.isRequired,
        icon: React.PropTypes.any.isRequired,
        label: React.PropTypes.any.isRequired
    };

    static defaultProps = {
        canActivate: false,
        onActiveToggle: () => {
        },
        active: false
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

    handleClick(event) {
        this.setState({show: !this.state.show});
        //switch (event.pointerType) {
        //    case 'mouse':
        //        if (this.props.canActivate) {
        //            this.props.onActiveToggle();
        //        }
        //        break;
        //    case 'touch':
        //        /* toggle menu visibility on touch devices with tap event */
        //        /* showing the menu is handled by mouse over event on touch devices */
        //        this.setState({show: !this.state.show});
        //        break;
        //    default:
        //        throw new Error('Unknown pointer type for press event: ' + event.pointerType);
        //}
    }

    handleMouseOver(event) {
        console.log(event.target);
        console.log(this.refs.cardContainer);
        if (!EventUtil.targetIsDescendant(event, this.refs.cardContainer)) {
            console.log('descendant')
            this.setState({show: true});
        }
    }

    handleMouseOut(event) {
        console.log(event.target);
        console.log(this.refs.cardContainer);
        if (!EventUtil.targetIsDescendant(event, this.refs.cardContainer)) {
            console.log('descendant')
            this.setState({show: false});
        }
    }

    handleDocumentClick(event) {
        if (this.state.show && !EventUtil.targetIsDescendant(event, this.refs.container)) {
            this.setState({show: false});
        }
    }

    render() {
        let {icon, label, className, children, ...other} = this.props;

        return <div
            ref="container"
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
            className={classNames(style['toolbar-menu-item-container'], className)}
            {...other}>
            <Button primary={this.state.show} onClick={this.handleClick} className={style['toolbar-menu-button']}>
                {icon} {label}
                <hr className={classNames(
                    style['toolbar-menu-status-bar'],
                    {[style['active']]: this.props.active && this.props.canActivate},
                    {[style['inactive']]: !this.props.active && this.props.canActivate},
                    {[style['neutral']]: !this.props.canActivate}
                )}/>
            </Button>
            <span ref="cardContainer">
                <Card className={classNames(style['toolbar-menu-context-container'], {[style['active']]: this.state.show})}>
                    <CardText>
                        {children}
                    </CardText>
                </Card>
            </span>
        </div>;
    }
};
