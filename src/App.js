import React from 'react';
import LocalStorageComponent from './LocalStorageComponent';
import {Map} from './Map';
import {HtmlMarker, TileLayer} from './Map/Layers';
import {Toolbar} from './Toolbar';
import {SearchMarker} from './Icons';
import LocationInfoBox from './LocationInfoBox';

export default class App extends LocalStorageComponent {
    constructor() {
        super();
        this.componentWillMount = this.componentWillMount.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLocationSelect = this.handleLocationSelect.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handlePopupClearClick = this.handlePopupClearClick.bind(this);
        this.renderTileLayers = this.renderTileLayers.bind(this);
        this.renderMarker = this.renderMarker.bind(this);
        this.renderMarkerIcon = this.renderMarkerIcon.bind(this);
        this.handleContextChange = this.handleContextChange.bind(this);
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
        }
    };

    componentWillMount() {
        this.setPersistenceKey('app');
        this.setStateMapping(state => ({view: state.view, map: state.map, traffic: state.traffic}));
        this.restoreState();
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    }

    handleViewChange(view) {
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

    renderTileLayers() {
        let url = 'https://{s}.api.tomtom.com/lbs/map/3/basic/' + this.state.map.style + '/{z}/{x}/{y}.png?key=wqz3ad2zvhnfsnwpddk6wgqq&tileSize=256';
        return <TileLayer url={url} displayCachedTiles={true}/>;
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
                {this.renderTileLayers()}
                {this.renderMarker()}
            </Map>
        </div>;

        //return <span>
        //    <TopBar onSearchSubmit={this.handleSearchSubmit}
        //            onSearchClear={this.handleSearchClear}
        //            onMapSelect={this.handleMapSelect}
        //            mapStyle={this.state.mapStyle}
        //            onTrafficChange={this.handleTrafficChange}
        //            onTrafficToggle={this.handleTrafficToggle}
        //            traffic={this.state.traffic}/>
        //    <MapView view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleLongViewChange} onLocationSelect={this.handleLocationSelect} onTap={this.handleMapTap}>
        //        <MapTilesLayer tileProvider={MapHelper} style={this.state.mapStyle} displayCachedTiles={true}/>
        //        <MapTilesLayer tileProvider={FlowHelper} style={this.state.traffic.flowStyle} active={this.state.traffic.show && this.state.traffic.showFlow}/>
        //        <MapTilesLayer tileProvider={TrafficHelper} style="s3" active={this.state.traffic.show && this.state.traffic.showTubes}/>
        //        {this.state.traffic.show && this.state.traffic.showIcons
        //            ? this.state.traffic.trafficIcons.map((poi, index) => {
        //            let {p: {x: longitude, y: latitude}} = poi;
        //            const IconType = IncidentsHelper.lookupIconType(poi);
        //            // <IconType viewBox="0 0 20 20"/>
        //            return <MapLayer key={index} latitude={latitude} longitude={longitude} render="html">
        //                <img src="images/place-holder.svg" width="20" height="20"/>
        //            </MapLayer>;
        //        })
        //            : null}
        //        <MapLayer {...this.state.locationMarkerInformation.location} render="html" active={this.state.locationMarker.show}>
        //            <Marker onTap={this.handleLocationMarkerTap} style={{width: '2rem', height: '3rem'}}>
        //                <SearchMarker viewBox="0 0 20 30"/>
        //            </Marker>
        //        </MapLayer>
        //        <MapLayer {...this.state.locationBoxInformation.location} render="html" active={this.state.locationBox.show}>
        //            <LocationInfoBox onClearClick={this.handleSearchClear} locationInformation={this.state.locationBoxInformation}/>
        //        </MapLayer>
        //    </MapView>
        //</span>;
    }
};
