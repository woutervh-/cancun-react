import React from 'react';
import Map from '../lib/Map.js';

export default class MapView extends React.Component {
    constructor() {
        super();
        this.handleClick = this.handleClick.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    static propTypes = {
        map: React.PropTypes.instanceOf(Map).isRequired
    };

    state = {
        zoom: 0,
        x: 0,
        y: 0
    };

    handleClick(event) {
    }

    handleWheel(event) {
        if (event.deltaY < 0) {
            this.setState({zoom: this.state.zoom + 1});
        }
        if (event.deltaY > 0) {
            this.setState({zoom: this.state.zoom - 1});
        }
    }

    render() {
        return <div onClick={this.handleClick} onWheel={this.handleWheel}>
            <div
                style={{float: 'left', content: 'url('+this.props.map.getTileUrl(this.state.zoom, this.state.x, this.state.y)+')'}}>
            </div>
            <div
                style={{float: 'left', content: 'url('+this.props.map.getTileUrl(this.state.zoom, this.state.x + 1, this.state.y)+')'}}>
            </div>
            <div style={{float: 'left', width: '100%'}}></div>

            <div
                style={{float: 'left', content: 'url('+this.props.map.getTileUrl(this.state.zoom, this.state.x, this.state.y + 1)+')'}}>
            </div>
            <div
                style={{float: 'left', content: 'url('+this.props.map.getTileUrl(this.state.zoom, this.state.x + 1, this.state.y + 1)+')'}}>
            </div>
            <div style={{float: 'left', width: '100%'}}></div>
        </div>;
    }
};
