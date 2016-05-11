import React from 'react';
import {RadioGroup, RadioButton} from 'react-toolbox';
import style from './style';

export default class MapSelect extends React.Component {
    static propTypes = {
        onMapSelect: React.PropTypes.func.isRequired,
        options: React.PropTypes.arrayOf(React.PropTypes.shape({
            label: React.PropTypes.string.isRequired,
            value: React.PropTypes.string.isRequired
        })).isRequired,
        selected: React.PropTypes.string
    };

    static defaultProps = {
        onMapSelect: () => {
        },
        options: []
    };

    shouldComponentUpdate(nextProps) {
        return this.props.onMapSelect != nextProps.onMapSelect
            || this.props.options != nextProps.options
            || this.props.selected != nextProps.selected;
    }

    render() {
        return <RadioGroup name="map" value={this.props.selected} onChange={this.props.onMapSelect}>
            {this.props.options.map((option, index) => <RadioButton key={index} className={style['radio-button']} label={option.label} value={option.value}/>)}
        </RadioGroup>;
    }
};
