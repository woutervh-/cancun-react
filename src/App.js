import React from 'react';
import LocalStorageComponent from './LocalStorageComponent';
import {Map} from './Map';
import {CanvasCache, HtmlMarker, Marker, TileLayer} from './Map/Layers';
import {Toolbar} from './Toolbar';
import {SearchMarker} from './Icons';
import LocationInfoBox from './LocationInfoBox';
import {SphericalMercator} from './Map/Geography/Projections';
import {PlaceHolder} from './Icons';
import shallowEqual from 'shallowequal';

import jsonp from 'jsonp';

export default class App extends LocalStorageComponent {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUpdate = this.componentWillUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.updateIncidents = this.updateIncidents.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLocationSelect = this.handleLocationSelect.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handlePopupClearClick = this.handlePopupClearClick.bind(this);
        this.renderMapTileLayer = this.renderMapTileLayer.bind(this);
        this.renderFlowTileLayer = this.renderFlowTileLayer.bind(this);
        this.renderTrafficTileLayer = this.renderTrafficTileLayer.bind(this);
        this.renderIncidentMarkers = this.renderIncidentMarkers.bind(this);
        this.renderMarker = this.renderMarker.bind(this);
        this.renderMarkerIcon = this.renderMarkerIcon.bind(this);
        this.handleContextChange = this.handleContextChange.bind(this);

        this.incidentsId = 0;
    }

    state = {
        width: window.innerWidth,
        height: window.innerHeight,
        view: {
            center: {latitude: 0, longitude: 0},
            zoom: 0
        },
        marker: {
            show: false,
            position: {latitude: 0, longitude: 0}
        },
        box: {
            title: '',
            subtitle: ''
        },
        map: {
            style: '1'
        },
        traffic: {
            show: false,
            showTubes: false,
            showIcons: false,
            flow: 'none'
        },
        incidents: []
    };

    shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.state, nextState);
    }

    componentWillMount() {
        this.setPersistenceKey('app');
        this.setStateMapping(state => ({view: state.view, map: state.map, traffic: state.traffic}));
        this.restoreState();
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        this.updateIncidents();
    }

    componentWillUpdate() {
        this.refs.map.invalidateCache('incidents');
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    updateIncidents() {
        const baseUrl = 'https://api.tomtom.com/lbs/services';
        const apiKey = 'wqz3ad2zvhnfsnwpddk6wgqq';
        const crs = new SphericalMercator();
        let zoomLevel = this.refs.map.zoomLevel();
        let {min: northWest, max: southEast} = this.refs.map.coordinateBounds();
        let earthNorthWest = crs.project(northWest);
        let earthSouthEast = crs.project(southEast);
        let boundingBox = earthNorthWest.x + ',' + earthSouthEast.y + ',' + earthSouthEast.x + ',' + earthNorthWest.y;
        let url = baseUrl + '/viewportDesc/3/' + boundingBox + '/' + zoomLevel + '/' + boundingBox + '/' + zoomLevel + '/false/jsonp?key=' + apiKey;
        let lastIncidentsId = ++this.incidentsId;
        jsonp(url, {param: 'jsonp'}, (error, data) => {
            if (!!error) {
                console.log(error);
            } else if (lastIncidentsId == this.incidentsId) {
                let trafficModelId = data['viewpResp']['trafficState']['@trafficModelId'];
                let boundingBox = northWest.latitude + ',' + southEast.longitude + ',' + southEast.latitude + ',' + northWest.longitude;
                let url = baseUrl + '/trafficIcons/3/s1/' + boundingBox + '/' + zoomLevel + '/' + trafficModelId + '/jsonp?key=' + apiKey + '&projection=EPSG4326';
                jsonp(url, {param: 'jsonp'}, (error, data) => {
                    if (!!error) {
                        console.log(error);
                    } else if (lastIncidentsId == this.incidentsId && 'tm' in data && 'poi' in data['tm']) {
                        this.refs.map.invalidateCache('incidents');
                        this.setState({incidents: data['tm']['poi'] || []});
                    }
                });
            }
        });
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    handleViewChange(view) {
        this.updateIncidents();
        this.setState({view});
    }

    handleLocationSelect(position, showDetails) {
        const displayNumber = number => Math.round(number * 1000000) / 1000000;
        const displayCoordinate = ({latitude, longitude}) => [latitude, longitude].map(displayNumber).join(', ');

        this.setState({
            marker: {
                show: true,
                position
            },
            box: {
                position,
                title: 'Coordinate',
                subtitle: displayCoordinate(position)
            }
        });

        if (showDetails) {
            this.refs.marker.show();
        }
    }

    handleSearchSubmit(result) {
        const displayNumber = number => Math.round(number * 1000000) / 1000000;
        const displayCoordinate = ({latitude, longitude}) => [latitude, longitude].map(displayNumber).join(', ');

        let {isCoordinate, location, ...position} = result;
        let zoom = Math.max(this.refs.map.zoom(), 12);
        this.setState({
            view: {
                center: position,
                zoom
            },
            marker: {
                show: true,
                position
            },
            box: {
                title: isCoordinate ? 'Coordinate' : location,
                subtitle: displayCoordinate(position)
            }
        });
    }

    handlePopupClearClick() {
        this.setState({
            marker: {
                ...this.state.marker,
                show: false
            }
        });
        this.refs.marker.hide();
    }

    renderMapTileLayer() {
        return <TileLayer url={'https://{s}.api.tomtom.com/lbs/map/3/basic/' + this.state.map.style + '/{z}/{x}/{y}.png?key=wqz3ad2zvhnfsnwpddk6wgqq&tileSize=256'} displayCachedTiles={true}/>;
    }

    renderFlowTileLayer() {
        if (this.state.traffic.show && this.state.traffic.flow != 'none') {
            return <TileLayer url={'https://{s}.api.tomtom.com/lbs/map/3/flow/' + this.state.traffic.flow + '/{z}/{x}/{y}.png?key=wqz3ad2zvhnfsnwpddk6wgqq&tileSize=256'}/>;
        }
    }

    renderTrafficTileLayer() {
        if (this.state.traffic.show && this.state.traffic.showTubes) {
            return <TileLayer url={'https://{s}.api.tomtom.com/lbs/map/3/traffic/s3/{z}/{x}/{y}.png?key=wqz3ad2zvhnfsnwpddk6wgqq&tileSize=256'}/>;
        }
    }

    renderIncidentMarkers() {
        if (this.state.traffic.show && this.state.traffic.showIcons) {
            return <CanvasCache id="incidents">
                {this.state.incidents.map((incident, index) => {
                    let {p: {x: longitude, y: latitude}} = incident;
                    return <Marker key={index} source={PlaceHolder} position={{latitude, longitude}} width={20} height={20} anchor={{x: 10, y: 10}}/>
                })}
            </CanvasCache>;
        }
    }

    renderMarker() {
        /* TODO: refactor this into generic Marker class (or HtmlMarker + CanvasMarker) with event capabilities */
        return <HtmlMarker
            ref="marker"
            position={this.state.marker.position}
            icon={this.renderMarkerIcon()}>
            <LocationInfoBox {...this.state.box} onClearClick={this.handlePopupClearClick}/>
        </HtmlMarker>;
    }

    renderMarkerIcon() {
        if (this.state.marker.show) {
            return <img
                src={SearchMarker}
                onTouchTap={() => {this.refs.marker.show()}}
                style={{width: '2rem', height: '3rem', position: 'absolute', marginTop: '-3rem', marginLeft: 'calc(2rem / -2)', cursor: 'pointer'}}
            />;
        }
    }

    handleContextChange(value) {
        this.setState(value);
    }

    render() {
        return <div>
            <Toolbar
                ref="toolbar"
                context={this.state}
                onContextChange={this.handleContextChange}
                onSearchSubmit={this.handleSearchSubmit}/>
            <Map
                ref="map"
                center={this.state.view.center}
                zoom={this.state.view.zoom}
                width={this.state.width}
                height={this.state.height}
                onViewChange={this.handleViewChange}
                onLocationSelect={this.handleLocationSelect}>
                {this.renderMapTileLayer()}
                {this.renderFlowTileLayer()}
                {this.renderTrafficTileLayer()}
                {this.renderIncidentMarkers()}
                {this.renderMarker()}
            </Map>
        </div>;
    }
};
