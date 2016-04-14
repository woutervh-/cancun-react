import {Autocomplete, Dropdown, Input, List, ListItem, Menu, MenuItem} from 'react-toolbox';
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
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
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
        width: 0,
        height: 0,
        focus: false,
        error: null
    };

    componentDidMount() {
        setTimeout(() => {
            let {width, height} = this.refs.suggestions.getBoundingClientRect();
            if (this.state.width != width || this.state.height != height) {
                this.setState({width, height});
            }
        });
    }

    componentDidUpdate() {
        this.componentDidMount();
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

    handleClearClick() {
        this.setState({query: '', results: [], error: null});
    }

    handleChange(input) {
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

    handleBlur() {
        console.log('blur');
        this.setState({focus: false});
    }

    handleFocus() {
        console.log('focus');
        this.setState({focus: true});
    }

    handleSubmit(event) {
        console.log('submit');
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

        let items = this.state.results.map((result, index) =>
            <ListItem
                key={index}
                itemContent={<span className={style['suggestions-item']}>{result.location}</span>}
            />
        );

        return <form {...this.props} onSubmit={this.handleSubmit} className={style['inline-children']}>
            <Input type="search" error={this.props.error} floating={false} label="Enter location" value={this.state.query} onChange={this.handleChange} onBlur={this.handleBlur} onFocus={this.handleFocus}>
                <div ref="suggestions"
                     className={classNames(style['suggestions'], {[style['active']]: this.state.focus})}
                     style={this.state.focus ? {clip: 'rect(0, ' + (this.state.width + 7) + 'px, ' + (this.state.height + 7) + 'px, 0)'} : null}>
                    <List ripple={true}>
                        {items}
                    </List>
                </div>
            </Input>
        </form>;

        //<Autocomplete multiple={false} direction="down" error={this.state.error} source={items} onChange={this.handleChange} floating={false} label="Enter location" value={this.state.query}/>
        //<Input type='text' label='Enter location' floating={false} value={this.state.query} onChange={this.handleChange}/>
        //<IconButton onClick={() => this.handleNewRequest(this.state.query, -1)}><ActionSearch/></IconButton>
        //<IconButton onClick={this.handleClearClick}><ContentClear/></IconButton>
    }
};
