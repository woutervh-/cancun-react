import React from 'react';

export default class Marker extends React.Component {
    static propTypes = {
        position: React.PropTypes.shape({
            latitude: React.PropTypes.number.isRequired,
            longitude: React.PropTypes.number.isRequired
        }).isRequired,
        anchor: React.PropTypes.shape({
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired
        }).isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        source: React.PropTypes.string.isRequired
    };

    static defaultProps = {
        anchor: {x: 0, y: 0}
    };

    render() {
        return null;
    }
};
