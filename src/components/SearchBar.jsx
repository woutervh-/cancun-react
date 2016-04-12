import ActionSearch from 'material-ui/lib/svg-icons/action/search';
import AutoComplete from 'material-ui/lib/auto-complete';
import ContentClear from 'material-ui/lib/svg-icons/content/clear';
import DeviceGpsFixed from 'material-ui/lib/svg-icons/device/gps-fixed';
import GeocodingHelper from '../lib/GeocodingHelper.js';
import IconButton from 'material-ui/lib/icon-button';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Paper from 'material-ui/lib/paper';
import React from 'react';

export default class SearchBar extends React.Component {
    constructor() {
        super();
        this.handleUpdateInput = this.handleUpdateInput.bind(this);
        this.handleNewRequest = this.handleNewRequest.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        onSubmit: React.PropTypes.func.isRequired,
        sendRequestTimeout: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        sendRequestTimeout: 200
    };

    state = {
        query: '',
        results: [],
        error: null
    };

    isCoordinate(query) {
        return /-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(query);
    }

    matchesForCoordinateQuery(query, callback) {
        let match = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/.exec(query);
        callback(null, [{query: query, location: query, isCoordinate: true, latitude: parseFloat(match[1]), longitude: parseFloat(match[3])}]);
    }

    matchesForFreeTextQuery(query, callback) {
        let geocodingHelper = new GeocodingHelper();
        geocodingHelper.getGeocodeResults(query, (error, results) => {
            if (!error) {
                callback(error, results.map(result => ({query: query, location: result['formattedAddress'], isCoordinate: false, latitude: result['latitude'], longitude: result['longitude']})));
            } else {
                callback(error, []);
            }
        });
    }

    handleUpdateInput(input) {
        if (this.isCoordinate(input)) {
            this.matchesForCoordinateQuery(input, (error, results) => {
                this.setState({query: input, error: null, results: results});
            });
        } else {
            this.setState({query: input, error: null});
            setTimeout(() => {
                if (this.state.query == input) {
                    this.matchesForFreeTextQuery(input, (error, results) => {
                        if (this.state.query == input) {
                            this.setState({results: results});
                        }
                    });
                }
            }, this.props.sendRequestTimeout);
        }
    }

    handleNewRequest(chosenRequest, index) {
        if (index >= 0) {
            let selected = this.state.results[index];
            this.setState({query: selected.location});
            this.props.onSubmit(selected);
        } else {
            let matchFunction = this.isCoordinate(chosenRequest) ? this.matchesForCoordinateQuery : this.matchesForFreeTextQuery;
            matchFunction(chosenRequest, (error, results) => {
                if (results.length > 0) {
                    let selected = results[0];
                    this.setState({query: selected.location});
                    this.props.onSubmit(selected);
                } else {
                    this.setState({error: 'No results found'});
                }
            });
        }
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        let items = this.state.results.map(result => {
            return {
                text: result.location,
                value: <MenuItem innerDivStyle={{overflow: 'hidden', textOverflow: 'ellipsis'}}
                                 primaryText={result.location}
                                 leftIcon={result.isCoordinate ? <DeviceGpsFixed/> : null}/>
            };
        });

        return <form {...this.props} onSubmit={this.handleSubmit}>
            <AutoComplete errorText={this.state.error}
                          openOnFocus={true}
                          searchText={this.state.query}
                          style={{float: 'left'}}
                          dataSource={items}
                          onUpdateInput={this.handleUpdateInput}
                          onNewRequest={this.handleNewRequest}
                          hintText="Enter location"
                          type="search"/>
            <Paper zDepth={0} style={{display: 'inline-block', backgroundColor: 'transparent'}}>
                <IconButton onClick={() => this.handleNewRequest(this.state.query, -1)}><ActionSearch/></IconButton>
            </Paper>
        </form>;
    }
};
