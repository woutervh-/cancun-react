import React from 'react';

export default class Rotate extends React.Component {
    static propTypes = {
        angle: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        angle: 0
    };
};
