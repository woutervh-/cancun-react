import React from 'react';
import MapHelper from './MapHelper';

export default class MapTilesLayer extends React.Component {
    static propTypes = {
        style: React.PropTypes.oneOf(MapHelper.styles.map(style => style.value)).isRequired,
        preloadHorizontal: React.PropTypes.number.isRequired,
        preloadVertical: React.PropTypes.number.isRequired,
        preloadLevels: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        preloadHorizontal: 0.5,
        preloadVertical: 0.5,
        preloadLevels: 1
    };
};
