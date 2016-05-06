import {Button, Card, CardActions , CardTitle, Chip, FontIcon} from 'react-toolbox';
import React from 'react';
import style from './style';
import classNames from 'classnames';
import SendLocation from '../public/images/send-location';

export default class LocationInfoBox extends React.Component {
    static propTypes = {
        onClearClick: React.PropTypes.func.isRequired,
        onSendLocation: React.PropTypes.func.isRequired,
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
        }
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.onClearClick != this.props.onClearClick
            || nextProps.onSendLocation != this.props.onSendLocation
            || nextProps.active != this.props.active
            || nextProps.locationInformation != this.props.locationInformation;
    }

    render() {
        const displayNumber = number => Math.round(number * 1000000) / 1000000;
        
        return <Card className={classNames(style['floating-location-box'], {[style['active']]: this.props.active})}>
            <CardTitle title={this.props.locationInformation.name}
                       subtitle={[this.props.locationInformation.location.latitude, this.props.locationInformation.location.longitude].map(displayNumber).join(', ')}/>
            <CardActions>
                <Button onClick={this.props.onClearClick} raised={false}><FontIcon value="clear" className={style['button-icon']}/> Clear Result</Button>
                <Button onClick={this.props.onSendLocation} raised={false}><SendLocation viewBox="0 0 20 20"/> Send Location</Button>
            </CardActions>
        </Card>;
    }
};
