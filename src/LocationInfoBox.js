import {Button, Card, CardActions , CardTitle, Chip, FontIcon} from 'react-toolbox';
import React from 'react';
import style from './style';
import classNames from 'classnames';
import SendLocation from '../public/images/send-location';
import layerContainerType from 'react-leaflet/lib/types/layerContainer';

export default class LocationInfoBox extends React.Component {
    static propTypes = {
        onClearClick: React.PropTypes.func.isRequired,
        onSendLocation: React.PropTypes.func.isRequired,
        locationInformation: React.PropTypes.shape({
            name: React.PropTypes.any.isRequired,
            details: React.PropTypes.any.isRequired
        }).isRequired,
        active: React.PropTypes.bool.isRequired,
        layerContainer: layerContainerType
    };

    static defaultProps = {
        onClearClick: () => {
        },
        onSendLocation: () => {
        }
    };

    componentDidMount() {
        this.oldCenter = this.props.layerContainer.getCenter;
    }

    componentDidUpdate() {
        this.oldCenter = this.props.layerContainer.getCenter;
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.onClearClick != this.props.onClearClick
            || nextProps.onSendLocation != this.props.onSendLocation
            || nextProps.locationInformation != this.props.locationInformation
            || nextProps.active != this.props.active
            || nextProps.layerContainer != this.props.layerContainer
            || this.props.layerContainer.getCenter() != this.oldCenter;
    }

    render() {
        console.log(this.props.layerContainer.getCenter());

        return <Card className={classNames(style['floating-location-box'], {[style['active']]: this.props.active})}>
            <CardTitle title={this.props.locationInformation.name}
                       subtitle={this.props.locationInformation.details}/>
            <CardActions>
                <Button onClick={this.props.onClearClick} raised={false}><FontIcon value="clear" className={style['button-icon']}/> Clear Result</Button>
                <Button onClick={this.props.onSendLocation} raised={false}><SendLocation viewBox="0 0 20 20"/> Send Location</Button>
            </CardActions>
        </Card>;
    }
};
