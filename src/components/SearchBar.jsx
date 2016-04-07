import ActionSearch from 'material-ui/lib/svg-icons/action/search';
import AutoComplete from 'material-ui/lib/auto-complete';
import ContentClear from 'material-ui/lib/svg-icons/content/clear';
import DeviceGpsFixed from 'material-ui/lib/svg-icons/device/gps-fixed';
import GeocodingHelper from '../lib/GeocodingHelper.js';
import IconButton from 'material-ui/lib/icon-button';
import MenuItem from 'material-ui/lib/menus/menu-item';
import React from 'react';

export default class SearchBar extends React.Component {
    constructor() {
        super();
        this.handleClearClick = this.handleClearClick.bind(this);
        this.handleUpdateInput = this.handleUpdateInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        onSubmit: React.PropTypes.func.isRequired
    };

    state = {
        query: '',
        results: []
    };

    matchesForQuery(query, callback) {
        // TODO: use me for when Enter is pressed -> find closest match

        if (/-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?/.test(query)) {
            let match = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/.exec(query);
            callback(null, {location: 'Coordinate', isCoordinate: true, latitude: parseFloat(match[1]), longitude: parseFloat(match[3])});
        } else {
            let geocodingHelper = new GeocodingHelper();
            geocodingHelper.getGeocodeResults(query, (error, results) => {
                if (!error) {
                    callback(error, results.map(result => {
                        return {location: result['formattedAddress'], isCoordinate: false, latitude: result['latitude'], longitude: result['longitude']};
                    }));
                } else {
                    callback(error, []);
                }
            });
        }
    }

    handleClearClick() {
        this.setState({query: '', results: []});
    }

    handleUpdateInput(input) {
        if (/-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?/.test(input)) {
            let match = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/.exec(input);
            this.setState({
                query: input,
                results: [{
                    text: input,
                    value: <MenuItem innerDivStyle={{overflow: 'hidden', textOverflow: 'ellipsis'}}
                                     primaryText={input}
                                     leftIcon={<DeviceGpsFixed/>}
                                     onTouchTap={this.handleSubmit}/>
                }]
            });
        } else {
            this.setState({
                query: input,
                results: []
            });
            let geocodingHelper = new GeocodingHelper();
            geocodingHelper.getGeocodeResults(input, (error, results) => {
                if (this.state.query == input) {
                    if (!error) {
                        this.setState({
                            query: input,
                            location: null,
                            latitude: null,
                            longitude: null,
                            loading: false,
                            dataSource: results.map(result => {
                                let handleListClick = (event) => {
                                    this.setState({
                                        location: result['formattedAddress'],
                                        latitude: parseFloat(result['latitude']),
                                        longitude: parseFloat(result['longitude'])
                                    });
                                    this.handleSubmit(event);
                                };
                                return {
                                    text: result['formattedAddress'],
                                    value: <MenuItem innerDivStyle={{overflow: 'hidden', textOverflow: 'ellipsis'}}
                                                     primaryText={result['formattedAddress']}
                                                     onTouchTap={handleListClick}/>
                                };
                            })
                        });
                    } else {
                        this.setState({
                            loading: false,
                            dataSource: []
                        });
                    }
                }
            });
        }
    }

    handleSubmit(event) {
        this.props.onSubmit(this.state.query + ' location: ' + this.state.location + ' lat: ' + this.state.latitude + ' lon: ' + this.state.longitude);
        event.preventDefault();
    }

    render() {
        let items = this.state.results.map(result =>
            <MenuItem innerDivStyle={{overflow: 'hidden', textOverflow: 'ellipsis'}}
                      primaryText={result.location}
                      leftIcon={result.isCoordinate ? <DeviceGpsFixed/> : null}
                      onTouchTap={this.handleSubmit}/>
        );

        return <form {...this.props} onSubmit={this.handleSubmit}>
            <AutoComplete searchText={this.state.query} style={{float: 'left'}} dataSource={items} onUpdateInput={this.handleUpdateInput} hintText="Enter location"/>
            <IconButton onClick={this.handleSubmit}><ActionSearch/></IconButton>
            <IconButton onClick={this.handleClearClick}><ContentClear/></IconButton>
        </form>;
    }
};
