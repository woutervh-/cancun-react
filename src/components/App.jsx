import AutoComplete from 'material-ui/lib/auto-complete';
import IconButton from 'material-ui/lib/icon-button';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import Map from '../lib/MapHelper';
import MapView from './MapView.jsx';
import MenuItem from 'material-ui/lib/menus/menu-item';
import NavigationMenu from 'material-ui/lib/svg-icons/navigation/menu';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';
import React from 'react';
import style from '../../public/stylesheets/style.css';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';

export default class App extends React.Component {
    constructor() {
        super();
        this.handleLeftIconButtonTouchTap = this.handleLeftIconButtonTouchTap.bind(this);
    }

    static propTypes = {
        map: React.PropTypes.instanceOf(Map).isRequired
    };

    static defaultProps = {
        map: new Map()
    };

    state = {
        dataSource: []
    };

    handleLeftIconButtonTouchTap() {

    }

    render() {
        return <div className={style['wrapper']}>
            <div className={style['content']}>
                <MapView/>
            </div>
            <Toolbar style={{position: 'absolute', top: 0, left: 0}}>
                <ToolbarGroup float="left" firstChild={true}>
                    <IconMenu style={{float: 'left'}}
                              iconButtonElement={<IconButton><NavigationMenu /></IconButton>}
                              targetOrigin={{horizontal: 'left', vertical: 'top'}}
                              anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}>
                        <MenuItem primaryText="Refresh"/>
                        <MenuItem primaryText="Help"/>
                        <MenuItem primaryText="Sign out"/>
                    </IconMenu>
                    <AutoComplete type="search" style={{float: 'left'}} dataSource={this.state.dataSource} hintText="Enter location..."/>
                </ToolbarGroup>
            </Toolbar>
        </div>;
    }
};
