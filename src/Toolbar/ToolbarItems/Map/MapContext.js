import React from 'react';
import {RadioGroup, RadioButton} from 'react-toolbox';
import style from './style';
import {MapHelper} from '../../../Map';

export default class MapContext extends React.Component {
    static propTypes = {
        onMapSelect: React.PropTypes.func.isRequired,
        selected: React.PropTypes.string
    };

    static defaultProps = {
        onMapSelect: () => {
        }
    };

    shouldComponentUpdate(nextProps) {
        return this.props.onMapSelect != nextProps.onMapSelect
            || this.props.selected != nextProps.selected;
    }

    render() {
        return <RadioGroup name="map" value={this.props.selected} onChange={this.props.onMapSelect}>
            {MapHelper.styles.map((option, index) => <RadioButton key={index} className={style['radio-button']} label={option.label} value={option.value}/>)}
        </RadioGroup>;
    }
};
