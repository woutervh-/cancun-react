import MapViewController from './MapViewController.jsx';
import React from 'react';

export default class MapViewContainer extends React.Component {
    constructor() {
        super();
        this.handleViewChange = this.handleViewChange.bind(this);
        this.handleLongViewChange = this.handleLongViewChange.bind(this);
    }

    static propTypes = {
        onViewChange: React.PropTypes.func.isRequired,
        onLongViewChange: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        onViewChange: () => {
        },
        onLongViewChange: () => {
        }
    };

    state = {
        view: {
            x: 0,
            y: 0,
            zoom: 0
        }
    };

    handleViewChange(view) {
        this.setState({view});
        this.props.onViewChange(view);
    }

    handleLongViewChange(view) {
        this.setState({view});
        this.props.onLongViewChange(view);
    }

    render() {
        return <MapViewController view={this.state.view} onViewChange={this.handleViewChange} onLongViewChange={this.handleLongViewChange}/>;
    }
};
