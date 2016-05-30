import React from 'react';

export default class Marker extends React.Component {
    static propTypes = {
        position: React.PropTypes.shape({
            latitude: React.PropTypes.number.isRequired,
            longitude: React.PropTypes.number.isRequired
        }).isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        image: React.PropTypes.any.isRequired
    };

    render() {
        return null;
    }
};
