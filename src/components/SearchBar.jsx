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
        loading: false,
        dataSource: []
    };

    handleClearClick() {
        this.setState({query: '', loading: false, dataSource: []});
    }

    handleUpdateInput(input) {
        if (/-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?/.test(input)) {
            this.setState({
                query: input,
                loading: false,
                dataSource: [{text: input, value: <MenuItem primaryText={input} rightIcon={<DeviceGpsFixed/>}/>}]
            });
        } else {
            this.setState({
                query: input,
                loading: true,
                dataSource: []
            });
            let geocodingHelper = new GeocodingHelper();
            geocodingHelper.getGeocodeResults(input, (error, results) => {
                if (this.state.query == input) {
                    if (!error) {
                        this.setState({
                            loading: false,
                            dataSource: results.map(result => result['formattedAddress'])
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
        this.props.onSubmit(this.state.query);
        event.preventDefault();
    }

    render() {
        return <form {...this.props} onSubmit={this.handleSubmit}>
            <AutoComplete searchText={this.state.query} style={{float: 'left'}} dataSource={this.state.dataSource} onUpdateInput={this.handleUpdateInput} hintText="Enter location"/>
            <IconButton onClick={this.handleSubmit}><ActionSearch/></IconButton>
            <IconButton onClick={this.handleClearClick}><ContentClear/></IconButton>
        </form>;
    }
};
