import {Autocomplete, Dropdown, Input} from 'react-toolbox';
import GeocodingHelper from '../lib/GeocodingHelper.js';
import React from 'react';
import style from './style.scss';

export default class SearchBar extends React.Component {
    constructor() {
        super();
        this.handleClearClick = this.handleClearClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
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

    matchesForQuery(query, callback) {
        if (/-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?/.test(query)) {
            let match = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/.exec(query);
            callback(null, [{query: query, location: query, latitude: parseFloat(match[1]), longitude: parseFloat(match[3])}]);
        } else {
            let geocodingHelper = new GeocodingHelper();
            geocodingHelper.getGeocodeResults(query, (error, results) => {
                if (!error) {
                    callback(error, results.map(result => ({query: query, location: result['formattedAddress'], latitude: result['latitude'], longitude: result['longitude']})));
                } else {
                    callback(error, []);
                }
            });
        }
    }

    handleClearClick() {
        this.setState({query: '', results: [], error: null});
    }

    handleChange(input) {
        console.log(input);
        this.setState({query: input, error: null});
        setTimeout(() => {
            if (this.state.query == input) {
                this.matchesForQuery(input, (error, results) => {
                    if (this.state.query == input) {
                        this.setState({results: results});
                    }
                });
            }
        }, this.props.sendRequestTimeout);
    }

    handleNewRequest(chosenRequest, index) {
        if (index >= 0) {
            let selected = this.state.results[index];
            this.setState({query: selected.location});
            this.props.onSubmit(selected);
        } else {
            this.matchesForQuery(chosenRequest, (error, results) => {
                if (results.length > 0) {
                    let selected = results[0];
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
        //let items = this.state.results.map(result => {
        //    return {
        //        text: result.location,
        //        value: <MenuItem innerDivStyle={{overflow: 'hidden', textOverflow: 'ellipsis'}}
        //                         primaryText={result.location}
        //                         leftIcon={result.location == 'Coordinate' ? <DeviceGpsFixed/> : null}/>
        //    };
        //});

        let items = this.state.results.map(result => result.location);

        return <form {...this.props} onSubmit={this.handleSubmit} className={style['inline']}>

        </form>;

        //<Autocomplete multiple={false} direction="down" error={this.state.error} source={items} onChange={this.handleChange} floating={false} label="Enter location" value={this.state.query}/>
        //<Input type='text' label='Enter location' floating={false} value={this.state.query} onChange={this.handleChange}/>
        //<IconButton onClick={() => this.handleNewRequest(this.state.query, -1)}><ActionSearch/></IconButton>
        //<IconButton onClick={this.handleClearClick}><ContentClear/></IconButton>
    }
};
