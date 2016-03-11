import React from 'react';
import MapView from './MapView.jsx';
import Map from '../lib/Map';

export default class App extends React.Component {
    static propTypes = {
        map: React.PropTypes.instanceOf(Map).isRequired
    };

    static defaultProps = {
        map: new Map()
    };

    render() {
        return <div className="row">
            <div className="col-1 menu">
                <ul>
                    <li>Item 56</li>
                </ul>
            </div>
            <div className="col-2">
                <MapView map={this.props.map}/>
            </div>
        </div>;
    }
};
