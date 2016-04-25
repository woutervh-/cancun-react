import React from 'react';

export default class Translate extends React.Component {
    static propTypes = {
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        x: 0,
        y: 0
    };
};
