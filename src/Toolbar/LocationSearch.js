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
        this.updateCurrentQuery = this.updateCurrentQuery.bind(this);
        this.handleUpdateInput = this.handleUpdateInput.bind(this);
        this.handleInputSubmit = this.handleInputSubmit.bind(this);
        this.handleClearClick = this.handleClearClick.bind(this);

        this.requestingQuery = '';
        this.currentQuery = '';
    }

    static propTypes = {
        sendRequestTimeout: React.PropTypes.number.isRequired,
        onSubmit: React.PropTypes.func.isRequired,
        onClear: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        sendRequestTimeout: 250,
        onSubmit: () => {
        },
        onClear: () => {
        }
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

    updateCurrentQuery(query, callback, timeout = this.props.sendRequestTimeout) {
        let queryMethod;
        if (this.isCoordinate(query)) {
            timeout = 0;
            queryMethod = this.matchesForCoordinateQuery;
        } else {
            queryMethod = this.matchesForFreeTextQuery;
        }

        this.requestingQuery = query;
        setTimeout(() => {
            if (this.requestingQuery == query && this.currentQuery != query) {
                this.currentQuery = query;
                queryMethod(query, (error, results) => {
                    if (this.requestingQuery == query) {
                        this.setState({error, results});
                        if (!!callback) {
                            callback(error, results);
                        }
                    }
                });
            } else if (this.requestingQuery == query) {
                if (!!callback) {
                    callback(this.state.error, this.state.results);
                }
            }
        }, timeout);
    }

    handleUpdateInput(query) {
        this.setState({error: ''});
        if (query.length > 0) {
            this.updateCurrentQuery(query);
        }
    }

    handleInputSubmit(query, index) {
        if (query.length > 0) {
            if (index >= 0) {
                this.props.onSubmit(this.state.results[index]);
            } else {
                this.updateCurrentQuery(query, (error, results)=> {
                    if (results.length > 0) {
                        this.props.onSubmit(results[0]);
                    } else {
                        this.setState({error: 'No results found'});
                    }
                }, 0);
            }
        }
    }

    handleClearClick() {
        this.setState({results: [], error: ''});
        this.refs.autocomplete.clear();
        this.props.onClear();
    }

    render() {
        return <span>
            <Autocomplete
                ref="autocomplete"
                error={this.state.error}
                label="Enter location"
                suggestions={this.state.results.map(result => result.location)}
                onUpdateInput={this.handleUpdateInput}
                onInputSubmit={this.handleInputSubmit}
                className={style['inline-block']}/>
            <IconButton icon="clear" type="button" onClick={this.handleClearClick} className={style['toolbar-item']}/>
            </span>;
    }
};
