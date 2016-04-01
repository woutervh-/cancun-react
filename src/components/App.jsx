import Map from '../lib/Map';
import MapView from './MapView.jsx';
import React from 'react';
import style from '../../public/stylesheets/style.css';

export default class App extends React.Component {
    static propTypes = {
        map: React.PropTypes.instanceOf(Map).isRequired
    };

    static defaultProps = {
        map: new Map()
    };

    render() {
        return <div className={style['wrapper']}>
            <div className={style['content']}>
                <MapView map={this.props.map}/>
            </div>
            <div className={style['menu']}>
                <ul>
                    <li>Item 1</li>
                </ul>
            </div>
        </div>;
    }
};
