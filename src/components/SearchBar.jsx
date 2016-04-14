import {Autocomplete, Dropdown, IconButton, Input, List, ListItem, Menu, MenuItem} from 'react-toolbox';
import classNames from 'classnames';
import GeocodingHelper from '../lib/GeocodingHelper.js';
import React from 'react';
import style from './style.scss';

export default class SearchBar extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.handleClearClick = this.handleClearClick.bind(this);
        this.handleSearchClick = this.handleSearchClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleItemMouseDown = this.handleItemMouseDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static propTypes = {
        onSubmit: React.PropTypes.func.isRequired,
        sendRequestTimeout: React.PropTypes.number.isRequired,
        menuCloseDelay: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        sendRequestTimeout: 200,
        menuCloseDelay: 200
    };

    state = {
        query: '',
        results: [],
        index: -1,
        focus: false,
        error: null,
        maxHeight: 0
    };

    componentDidMount() {
        setImmediate(() => {
            this.setState({maxHeight: window.innerHeight - this.refs.suggestions.offsetTop});
        });
    }

    componentDidUpdate() {
        if (this.state.maxHeight != window.innerHeight - this.refs.suggestions.offsetTop) {
            this.componentDidMount();
        }
    }

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

    submit() {
        if (this.state.index < 0) {
            let matchFunction = this.isCoordinate(this.state.query) ? this.matchesForCoordinateQuery : this.matchesForFreeTextQuery;
            matchFunction(this.state.query, (error, results) => {
                if (results.length > 0) {
                    let selected = results[0];
                    this.setState({query: selected.location});
                    this.props.onSubmit(selected);
                } else {
                    this.setState({error: 'No results found'});
                }
            });
        } else {
            let selected = this.state.results[this.state.index];
            this.setState({query: selected.location});
            this.props.onSubmit(selected);
        }
    }

    handleClearClick() {
        this.setState({query: '', results: [], error: null, index: -1});
    }

    handleSearchClick() {
        this.submit();
    }

    handleChange(input) {
        if (this.isCoordinate(input)) {
            this.matchesForCoordinateQuery(input, (error, results) => {
                this.setState({query: input, error: null, results: results, index: -1});
            });
        } else {
            this.setState({query: input, error: null, index: -1});
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

    handleBlur() {
        this.setState({focus: false});
    }

    handleFocus() {
        this.setState({focus: true});
    }

    handleItemMouseDown(index) {
        let result = this.state.results[index];
        setTimeout(() => {
            this.setState({query: result.location, focus: false, index: index}, () => this.refs.input.blur());
            this.submit();
        }, this.props.menuCloseDelay);
    }

    handleKeyUp(event) {
        switch (event.which) {
            case 13:
                if (this.state.index >= 0 && this.state.index < this.state.results.length) {
                    let result = this.state.results[this.state.index];
                    this.setState({query: result.location, focus: false}, () => this.refs.input.blur());
                }
                this.submit();
                break;
            case 38:
            case 40:
                let newIndex = this.state.index + (event.which == 38 ? -1 : 1);
                if (newIndex >= 0 && newIndex < this.state.results.length) {
                    this.setState({index: newIndex});
                }
                break;
            default:
                break;
        }
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        let items = this.state.results.map((result, index) =>
            <ListItem key={index}
                      className={classNames({[style['active']]: this.state.index == index})}
                      itemContent={<span className={style['suggestions-item']}>{result.location}</span>}
                      onMouseDown={() => this.handleItemMouseDown(index)}/>
        );

        return <form {...this.props} onSubmit={this.handleSubmit} className={style['inline-children']}>
            <Input type="search"
                   error={this.props.error}
                   floating={false}
                   label="Enter location"
                   value={this.state.query}
                   onChange={this.handleChange}
                   onBlur={this.handleBlur}
                   onFocus={this.handleFocus}
                   onKeyUp={this.handleKeyUp}
                   ref="input">
                <div ref="suggestions"
                     className={classNames(style['suggestions'], {[style['active']]: this.state.focus && this.state.results.length >= 1})}
                     style={{maxHeight: this.state.maxHeight}}>
                    <List ripple={true}>
                        {items}
                    </List>
                </div>
            </Input>
            <IconButton icon="clear" type="button" onClick={this.handleClearClick}/>
            <IconButton icon="search" type="button" onClick={this.handleSearchClick}/>
        </form>;
    }
};
