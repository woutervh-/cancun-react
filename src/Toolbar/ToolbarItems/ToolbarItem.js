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
    }

    static propTypes = {
        icon: React.PropTypes.any.isRequired,
        label: React.PropTypes.any.isRequired,
        buttonClassName: React.PropTypes.string.isRequired,
        cardClassName: React.PropTypes.string.isRequired
    };

    static defaultProps = {
        buttonClassName: '',
        cardClassName: ''
    };

    state = {
        show: false
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.icon != nextProps.icon
            || this.props.label != nextProps.label
            || this.props.buttonClassName != nextProps.buttonClassName
            || this.props.cardClassName != nextProps.cardClassName
            || this.props.children != nextProps.children
            || this.state.show != nextState.show;
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
        this.setState({show: !this.state.show});
    }

    handleDocumentClick(event) {
        if (this.state.show && !EventUtil.targetIsDescendant(event, this.refs.container)) {
            this.setState({show: false});
        }
    }

    render() {
        let {icon, label, children, buttonClassName, cardClassName, ...rest} = this.props;

        return <div ref="container" {...rest}>
            <Button onClick={this.handleClick}
                    primary={this.state.show}
                    className={classNames(style['button'], {[style['active']]: this.state.show}, buttonClassName)}>
                {icon} {label}
            </Button>
            <Card className={classNames(style['context-container'], {[style['active']]: this.state.show}, cardClassName)}>
                <CardText>
                    {children}
                </CardText>
            </Card>
        </div>;
    }
};
