import React from 'react';

export default class MapLayer extends React.Component {
    static propTypes = {
        latitude: React.PropTypes.number.isRequired,
        longitude: React.PropTypes.number.isRequired,
        render: React.PropTypes.string.isRequired
    };

    static defaultProps = {
        render: 'canvas'
    };
};
