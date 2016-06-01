import {Button, Card, CardText, MenuDivider, Switch} from 'react-toolbox';
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
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleSwitchChange = this.handleSwitchChange.bind(this);

        this.cancelMouseOut = false;
        this.preventClick = false;
        this.preventMouseOver = false;
    }

    static propTypes = {
        canActivate: React.PropTypes.bool.isRequired,
        onActiveChange: React.PropTypes.func.isRequired,
        active: React.PropTypes.bool.isRequired,
        switchLabel: React.PropTypes.string.isRequired,
        icon: React.PropTypes.any.isRequired,
        label: React.PropTypes.any.isRequired
    };

    static contextTypes = {
        touchevents: React.PropTypes.bool.isRequired,
        pointerevents: React.PropTypes.bool.isRequired
    };

    static defaultProps = {
        canActivate: false,
        onActiveChange: () => {
        },
        active: false,
        switchLabel: 'Enable'
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

    handleClick() {
        if (this.preventClick) {
            this.preventClick = false;
        } else {
            if (this.props.canActivate) {
                this.props.onActiveChange(!this.props.active);
            }
        }
    }

    handleTouchStart() {
        /*  prevent click and mouse over from doing their usual stuff */
        this.preventClick = true;
        this.preventMouseOver = true;
    }

    handleTouchEnd() {
        this.setState({show: !this.state.show});
    }

    handleMouseOver() {
        if (this.state.show) {
            this.cancelMouseOut = true;
        } else {
            if (this.preventMouseOver) {
                this.preventMouseOver = false;
            } else {
                this.setState({show: true});
            }
        }
    }

    handleMouseOut() {
        if (this.state.show) {
            this.cancelMouseOut = false;
            setImmediate(() => {
                if (!this.cancelMouseOut) {
                    this.setState({show: false});
                }
            });
        }
    }

    handleDocumentClick(event) {
        if (this.state.show && !EventUtil.targetIsDescendant(event, this.refs.container)) {
            this.setState({show: false});
        }
    }

    handleSwitchChange(value) {
        this.props.onActiveChange(value);
    }

    render() {
        let {icon, label, className, children, ...other} = this.props;

        return <div
            ref="container"
            onMouseOver={this.handleMouseOver}
            onMouseOut={this.handleMouseOut}
            className={classNames(style['toolbar-menu-item-container'], className)}
            {...other}>
            <Button primary={this.state.show} onClick={this.handleClick} onTouchStart={this.handleTouchStart} onTouchEnd={this.handleTouchEnd} className={style['toolbar-menu-button']}>
                {icon} {label}
                <hr className={classNames(
                    style['toolbar-menu-status-bar'],
                    {[style['active']]: this.props.active && this.props.canActivate},
                    {[style['inactive']]: !this.props.active && this.props.canActivate},
                    {[style['neutral']]: !this.props.canActivate}
                )}/>
            </Button>
            <Card className={classNames(style['toolbar-menu-context-container'], {[style['active']]: this.state.show})}>
                <CardText>
                    {this.props.canActivate && (this.context.touchevents || this.context.pointerevents) ?
                        <span>
                            <Switch checked={this.props.active} label={this.props.switchLabel} onChange={this.handleSwitchChange}/>
                            <MenuDivider/>
                        </span>
                        : null}
                    {children}
                </CardText>
            </Card>
        </div>;
    }
};
