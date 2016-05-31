import {Button, Card, CardActions , CardTitle, FontIcon} from 'react-toolbox';
import React from 'react';
import style from './style';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';

export default class LocationInfoBox extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
    }

    static propTypes = {
        onClearClick: React.PropTypes.func.isRequired,
        onSendLocation: React.PropTypes.func.isRequired,
        title: React.PropTypes.string.isRequired,
        subtitle: React.PropTypes.string.isRequired
    };

    static defaultProps = {
        onClearClick: () => {
        },
        onSendLocation: () => {
        }
    };

    shouldComponentUpdate(nextProps) {
        return !shallowEqual(this.props, nextProps);
    }

    render() {
        return <Card>
            <CardTitle title={this.props.title} subtitle={this.props.subtitle}/>
            <CardActions>
                <Button onClick={this.props.onClearClick} raised={false}><FontIcon value="clear" className={style['button-icon']}/> Clear Result</Button>

            </CardActions>
        </Card>;

        //<Button onClick={this.props.onSendLocation} raised={false}><SendLocation viewBox="0 0 20 20"/> Send Location</Button>
    }
};
