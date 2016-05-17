import React from 'react';
import MapHelper from './MapHelper';
import TrafficHelper from './TrafficHelper';
import MapLayer from './MapLayer';

export default class MapTilesLayer extends React.Component {
    static propTypes = {
        tileProvider: React.PropTypes.oneOf([MapHelper, TrafficHelper]).isRequired,
        style: React.PropTypes.oneOf([...MapHelper.styles.map(style => style.value), ...TrafficHelper.styles.map(style => style.value)]).isRequired,
        preloadHorizontal: React.PropTypes.number.isRequired,
        preloadVertical: React.PropTypes.number.isRequired,
        preloadLevels: React.PropTypes.number.isRequired,
        displayCachedTiles: React.PropTypes.bool.isRequired
    };

    static defaultProps = {
        preloadHorizontal: 0.5,
        preloadVertical: 0.5,
        preloadLevels: 1,
        displayCachedTiles: false
    };

    static lowPriority = 0;
    static highPriority = 1;
}
