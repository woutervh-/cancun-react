import React from 'react';
import FlowHelper from './FlowHelper';
import MapHelper from './MapHelper';
import TrafficHelper from './TrafficHelper';
import MapLayer from './MapLayer';

export default class MapTilesLayer extends React.Component {
    static propTypes = {
        tileProvider: React.PropTypes.oneOf([
            FlowHelper,
            MapHelper,
            TrafficHelper
        ]).isRequired,
        style: React.PropTypes.oneOf([
            ...FlowHelper.styles.map(style => style.value),
            ...MapHelper.styles.map(style => style.value),
            ...TrafficHelper.styles.map(style => style.value)
        ]).isRequired,
        preloadHorizontal: React.PropTypes.number.isRequired,
        preloadVertical: React.PropTypes.number.isRequired,
        displayCachedTiles: React.PropTypes.bool.isRequired,
        active: React.PropTypes.bool.isRequired
    };

    static defaultProps = {
        preloadHorizontal: 1,
        preloadVertical: 1,
        displayCachedTiles: false,
        active: true
    };
}
