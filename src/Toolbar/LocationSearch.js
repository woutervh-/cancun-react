import {IconButton, Input, List, ListItem} from 'react-toolbox';
import classNames from 'classnames';
import React from 'react';
import style from './style';
import {Autocomplete} from './Autocomplete';
import Geocoding from '../Geocoding';
import shallowEqual from 'shallowequal';

export default class LocationSearch extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.isCoordinate = this.isCoordinate.bind(this);
        this.matchesForCoordinateQuery = this.matchesForCoordinateQuery.bind(this);
        this.matchesForFreeTextQuery = this.matchesForFreeTextQuery.bind(this);
        this.handleUpdateInput = this.handleUpdateInput.bind(this);
        this.handleInputSubmit = this.handleInputSubmit.bind(this);

        this.query = '';
    }

    static propTypes = {
        sendRequestTimeout: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        sendRequestTimeout: 250
    };

    state = {
        results: [],
        error: ''
    };

    shouldComponentUpdate(nextProps, nextState) {
        return !(shallowEqual(this.props, nextProps) && shallowEqual(this.state, nextState));
    }

    isCoordinate(query) {
        return /-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(query);
    }

    matchesForCoordinateQuery(query, callback) {
        let match = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/.exec(query);
        callback(null, [{location: query, isCoordinate: true, latitude: parseFloat(match[1]), longitude: parseFloat(match[3])}]);
    }

    matchesForFreeTextQuery(query, callback) {
        Geocoding.forwardGeocode(query, (error, results) => {
            if (!error) {
                callback(error, results.map(result => ({location: result['formattedAddress'], isCoordinate: false, latitude: result['latitude'], longitude: result['longitude']})));
            } else {
                callback(error, []);
            }
        });
    }

    handleUpdateInput(query) {
        if (this.isCoordinate(query)) {
            this.matchesForCoordinateQuery(query, (error, results) => {
                this.setState({error, results});
            });
        } else {
            this.query = query;
            setTimeout(() => {
                if (this.query == query) {
                    this.matchesForFreeTextQuery(query, (error, results) => {
                        if (this.query == query) {
                            this.setState({error, results});
                        }
                    });
                }
            }, this.props.sendRequestTimeout);
        }
    }

    handleInputSubmit(query, index) {
        console.log('submitted: ' + query + ' (' + index + ')')
        /*
         if(results.length <= 0) this.setState({error: 'No results found'});
        * */
    }

    render() {
        return <Autocomplete
            error={this.state.error}
            suggestions={this.state.results.map(result => result.location)}
            onUpdateInput={this.handleUpdateInput}
            onInputSubmit={this.handleInputSubmit}/>;
    }
};
