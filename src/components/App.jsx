import Map from '../lib/MapHelper';
import MapView from './MapView.jsx';
import React from 'react';
import style from '../../public/stylesheets/style.css';
import TextField from 'material-ui/lib/text-field';
import Toolbar from 'material-ui/lib/toolbar/toolbar';

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

    state = {};

    handleTileSizeChange(event) {
        this.setState({tileSize: event.currentTarget.value});
    }

    render() {
        return <div className={style['wrapper']}>
            <div className={style['content']}>
                <MapView/>
            </div>
            <Toolbar style={{position: 'absolute', top: 0, left: 0, zIndex: 2}}>
                <TextField hintText="Enter location...?"/>
            </Toolbar>
        </div>;
    }
};
