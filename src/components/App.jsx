import React from 'react';
import MapView from './MapView.jsx';

export default class App extends React.Component {
    render() {
        return <div className="row">
            <div className="col-1 menu">
                <ul>
                    <li>Item 1</li>
                </ul>
            </div>
            <div className="col-2">
                <MapView/>
            </div>
        </div>
    }
};
