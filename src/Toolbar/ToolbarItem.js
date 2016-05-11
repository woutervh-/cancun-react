import {Button, Card, CardText} from 'react-toolbox';
import React from 'react';
import style from './style';
import classNames from 'classnames';
import EventUtil from '../EventUtil';

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
        label: React.PropTypes.any.isRequired
    };

    static defaultProps = {
        icon: null,
        label: null
    };

    state = {
        active: false
    };

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.icon != nextProps.icon
            || this.props.label != nextProps.label
            || this.props.children != nextProps.children
            || this.state.active != nextProps.active;
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

    handleClick() {
        this.setState({active: !this.state.active});
    }

    handleDocumentClick(event) {
        if (this.state.active && !EventUtil.targetIsDescendant(event, this.refs.container)) {
            this.setState({active: false});
        }
    }

    render() {
        return <div ref="container">
            <Button onClick={this.handleClick} raised={this.state.active}
                    primary={this.state.active}>{this.props.icon} {this.props.label}</Button>
            <Card className={classNames(style['toolbar-context-container'], {[style['active']]: this.state.active})}>
                <CardText>
                    {this.props.children}
                </CardText>
            </Card>
        </div>;
    }
};
