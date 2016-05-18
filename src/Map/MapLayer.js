import React from 'react';

export default class MapLayer extends React.Component {
    static propTypes = {
        latitude: React.PropTypes.number.isRequired,
        longitude: React.PropTypes.number.isRequired,
        render: React.PropTypes.oneOf(['canvas', 'html']).isRequired,
        active: React.PropTypes.bool.isRequired
    };

    static defaultProps = {
        render: 'canvas',
        active: true
    };
};
