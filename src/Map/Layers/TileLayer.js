import React from 'react';

export default class TileLayer extends React.Component {
    static propTypes = {
        url: React.PropTypes.string.isRequired,
        minZoom: React.PropTypes.number.isRequired,
        maxZoom: React.PropTypes.number.isRequired,
        tileSize: React.PropTypes.number.isRequired,
        subdomains: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        displayCachedTiles: React.PropTypes.bool.isRequired
    };

    static defaultProps = {
        minZoom: 0,
        maxZoom: 18,
        tileSize: 256,
        subdomains: ['a', 'b', 'c', 'd'],
        displayCachedTiles: false
    };

    url() {
        return 'http://';
    }

    render() {
        return null;
    }
};
