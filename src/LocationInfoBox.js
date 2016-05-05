import {Button, FontIcon} from 'react-toolbox';
import React from 'react';
import style from './style';
import classNames from 'classnames';
import SendLocation from '../public/images/send-location';
import EventUtil from './EventUtil';

export default class LocationInfoBox extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
    }

    static propTypes = {
        onClearClick: React.PropTypes.func.isRequired,
        onSendLocation: React.PropTypes.func.isRequired,
        onRemoveFocus: React.PropTypes.func.isRequired,
        active: React.PropTypes.bool.isRequired,
        locationInformation: React.PropTypes.shape({
            name: React.PropTypes.any.isRequired,
            location: React.PropTypes.shape({
                latitude: React.PropTypes.number.isRequired,
                longitude: React.PropTypes.number.isRequired
            }).isRequired
        }).isRequired
    };

    static defaultProps = {
        onClearClick: () => {
        },
        onSendLocation: () => {
        },
        onRemoveFocus: () => {
        }
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.onClearClick != this.props.onClearClick
            || nextProps.onSendLocation != this.props.onSendLocation
            || nextProps.active != this.props.active
            || nextProps.locationInformation != this.props.locationInformation;
    }

    componentDidMount() {
        if (this.props.active) {
            document.addEventListener('click', this.handleDocumentClick);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.active && !prevProps.active) {
            document.addEventListener('click', this.handleDocumentClick);
        } else if (!this.props.active && prevProps.active) {
            document.removeEventListener('click', this.handleDocumentClick);
        }
    }

    componentWillUnmount() {
        if (this.props.active) {
            document.removeEventListener('click', this.handleDocumentClick);
        }
    }

    handleDocumentClick(event) {
        if (this.props.active && !EventUtil.targetIsDescendant(event, this.refs.container)) {
            this.props.onRemoveFocus(event);
        }
    }

    render() {
        const displayNumber = number => Math.round(number * 1000000) / 1000000;

        return <div ref="container" className={classNames(style['location-box'], {[style['active']]: this.props.active})}>
            <div className={style['location-box-info']}>
                <header>
                    {this.props.locationInformation.name}
                </header>
                <p>
                    {displayNumber(this.props.locationInformation.location.latitude)},
                    {displayNumber(this.props.locationInformation.location.longitude)}
                </p>
            </div>
            <div className={style['location-box-actions']}>
                <Button onClick={this.props.onClearClick} raised={false}><FontIcon value="clear" className={style['button-icon']}/> Clear Result</Button>
                <Button onClick={this.props.onSendLocation} raised={false}><SendLocation viewBox="0 0 20 20"/> Send Location</Button>
            </div>
        </div>;
    }
};
