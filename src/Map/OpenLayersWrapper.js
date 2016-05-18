import openlayers from 'openlayers/src/ol/ol';
import React from 'react';

export default class OpenLayersWrapper extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
        this.map = openlayers.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            target: this.refs.map,
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });
    }

    render() {
        <div ref="map"/>
    }
};
