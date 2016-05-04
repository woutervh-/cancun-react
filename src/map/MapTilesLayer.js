import MapHelper from './MapHelper';
import MapLayer from './MapLayer';
import React from 'react';
import {Canvas, Composition, Picture, Rectangle, Scale, Translate} from './canvas';
import VectorUtil from '../VectorUtil';

export default class MapTilesLayer extends React.Component {
    static propTypes = {
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
