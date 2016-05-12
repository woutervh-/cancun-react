import {Button, Card, CardText} from 'react-toolbox';
import React from 'react';
import style from './style';
import classNames from 'classnames';
import EventUtil from '../../EventUtil';

export default class ToolbarItem extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }

    static propTypes = {
        show: React.PropTypes.bool.isRequired,
        active: React.PropTypes.bool.isRequired,
        onToggleShow: React.PropTypes.func.isRequired,
        onToggleActive: React.PropTypes.func.isRequired,
        icon: React.PropTypes.any.isRequired,
        label: React.PropTypes.any.isRequired,
        buttonClassName: React.PropTypes.string.isRequired,
        cardClassName: React.PropTypes.string.isRequired
    };

    static defaultProps = {
        onToggleShow: () => {
        },
        onToggleActive: () => {
        },
        buttonClassName: '',
        cardClassName: ''
    };

    shouldComponentUpdate(nextProps) {
        return this.props.show != nextProps.show
            || this.props.active != nextProps.active
            || this.props.onToggleShow != nextProps.onToggleShow
            || this.props.onToggleActive != nextProps.onToggleActive
            || this.props.icon != nextProps.icon
            || this.props.label != nextProps.label
            || this.props.buttonClassName != nextProps.buttonClassName
            || this.props.cardClassName != nextProps.cardClassName
            || this.props.children != nextProps.children;
    }

    componentDidMount() {
        if (this.props.show) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.show && !prevProps.show) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        } else if (!this.props.show && prevProps.show) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentWillUnmount() {
        if (this.props.show) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    handleClick() {
        this.props.onToggleActive(!this.props.active);
    }

    handleDocumentClick(event) {
        if (this.props.show && !EventUtil.targetIsDescendant(event, this.refs.container)) {
            this.props.onToggleActive(false);
        }
    }

    handleMouseOver() {
        this.props.onToggleShow(true);
    }

    handleMouseOut() {
        this.props.onToggleShow(false);
    }

    render() {
        let {icon, label, children, buttonClassName, cardClassName, ...rest} = this.props;

        return <div ref="container" onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut} {...rest}>
            <Button
                onClick={this.handleClick}
                primary={this.props.active}
                className={classNames(style['button'], {[style['active']]: this.props.show}, buttonClassName)}
            >
                {icon} {label}
            </Button>
            <Card className={classNames(style['context-container'], {[style['active']]: this.props.show}, cardClassName)}>
                <CardText>
                    {children}
                </CardText>
            </Card>
        </div>;
    }
};
