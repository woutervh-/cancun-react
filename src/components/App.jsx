import Map from '../lib/MapHelper';
import MapView from './MapView.jsx';
import React from 'react';
import style from '../../public/stylesheets/style.css';

export default class App extends React.Component {
    constructor() {
        super();
        this.handleTileSizeChange = this.handleTileSizeChange.bind(this);
    }

    static propTypes = {
        map: React.PropTypes.instanceOf(Map).isRequired
    };

    static defaultProps = {
        map: new Map()
    };

    state = {
    };

    handleTileSizeChange(event) {
        this.setState({tileSize: event.currentTarget.value});
    }

    render() {
        return <div className={style['wrapper']}>
            <div className={style['content']}>
                <MapView/>
            </div>
            <div className={style['menu']}>
                <ul>
                    <li>Item 1</li>
                    <li>
                        <div>
                            <input type="radio" id="tile-size-256" name="tile-size" checked={this.state.tileSize == 256} value={256} onChange={this.handleTileSizeChange}/>
                            <label htmlFor="tile-size-256">256</label>
                        </div>
                        <div>
                            <input type="radio" id="tile-size-512" name="tile-size" checked={this.state.tileSize == 512} value={512} onChange={this.handleTileSizeChange}/>
                            <label htmlFor="tile-size-512">512</label>
                        </div>
                    </li>
                </ul>
            </div>
        </div>;
    }
};
