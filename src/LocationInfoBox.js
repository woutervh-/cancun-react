import {Button, FontIcon} from 'react-toolbox';
import React from 'react';
import style from './style';
import classNames from 'classnames';
import Satellite from '../public/images/send-location';

export default class LocationInfoBox extends React.Component {
    static propTypes = {
        onClearClick: React.PropTypes.func.isRequired,
        onSendLocation: React.PropTypes.func.isRequired,
        active: React.PropTypes.bool.isRequired,
        searchInformation: React.PropTypes.shape({
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
        }
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.onClearClick != this.props.onClearClick
            || nextProps.onSendLocation != this.props.onSendLocation
            || nextProps.active != this.props.active
            || nextProps.searchInformation != this.props.searchInformation;
    }

    render() {
        return <span className={classNames(style['bottom-bar-container'], {[style['active']]: this.props.active})}>
            <div className={classNames(style['bottom-bar'], {[style['active']]: this.props.active})}>
                <div className={style['bottom-bar-info']}>
                    <header>
                        {this.props.searchInformation.name}
                    </header>
                    <p>
                        {this.props.searchInformation.location.latitude},
                        {this.props.searchInformation.location.longitude}
                    </p>
                </div>
                <div className={style['bottom-bar-actions']}>
                    <Button onClick={this.props.onClearClick} raised={true}><FontIcon value="clear" className={style['button-icon']}/> Clear Result</Button>
                    <Button onClick={this.props.onSendLocation} raised={true}><Satellite viewBox="0 0 20 20"/> Send Location</Button>
                </div>
            </div>
        </span>;
    }
};
