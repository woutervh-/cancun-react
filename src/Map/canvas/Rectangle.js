import React from 'react';

export default class Rectangle extends React.Component {
    static propTypes = {
        left: React.PropTypes.number.isRequired,
        top: React.PropTypes.number.isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        strokeStyle: React.PropTypes.any,
        fillStyle: React.PropTypes.any
    };

    static defaultProps = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        strokeStyle: 'rgba(0, 0, 0, 1)',
        fillStyle: 'rgba(255, 255, 255, 0)'
    };
};
