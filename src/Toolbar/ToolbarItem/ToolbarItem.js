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
        active: React.PropTypes.bool.isRequired,
        onToggle: React.PropTypes.func.isRequired,
        icon: React.PropTypes.any.isRequired,
        label: React.PropTypes.any.isRequired,
        buttonClassName: React.PropTypes.string.isRequired,
        cardClassName: React.PropTypes.string.isRequired
    };

    static defaultProps = {
        active: false,
        onToggle: () => {
        },
        icon: null,
        label: null,
        buttonClassName: '',
        cardClassName: ''
    };

    shouldComponentUpdate(nextProps) {
        return this.props.icon != nextProps.icon
            || this.props.label != nextProps.label
            || this.props.buttonClassName != nextProps.buttonClassName
            || this.props.cardClassName != nextProps.cardClassName
            || this.props.children != nextProps.children
            || this.props.active != nextProps.active
            || this.props.onToggle!= nextProps.onToggle;
    }

    componentDidMount() {
        if (this.props.active) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.active && !prevProps.active) {
            document.addEventListener('mousedown', this.handleDocumentClick);
        } else if (!this.props.active && prevProps.active) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    componentWillUnmount() {
        if (this.props.active) {
            document.removeEventListener('mousedown', this.handleDocumentClick);
        }
    }

    handleClick() {
        this.props.onToggle(!this.props.active);
    }

    handleDocumentClick(event) {
        if (this.props.active && !EventUtil.targetIsDescendant(event, this.refs.container)) {
            this.props.onToggle(false);
        }
    }

    render() {
        let {icon, label, children, buttonClassName, cardClassName, ...rest} = this.props;

        return <div ref="container" {...rest}>
            <Button onClick={this.handleClick} accent={this.props.active} primary={this.props.active} className={buttonClassName}>
                {icon} {label}
            </Button>
            <Card className={classNames(style['toolbar-item-context-container'], {[style['active']]: this.props.active}, cardClassName)}>
                <CardText>
                    {children}
                </CardText>
            </Card>
        </div>;
    }
};
