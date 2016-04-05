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
            <div className={style['top-menu']}>
                    This is the menu
            </div>
        </div>;
    }
};
