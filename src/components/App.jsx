import ActionSearch from 'material-ui/lib/svg-icons/action/search';
import AutoComplete from 'material-ui/lib/auto-complete';
import ContentClear from 'material-ui/lib/svg-icons/content/clear';
import IconButton from 'material-ui/lib/icon-button';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MapHelper from '../lib/MapHelper.js';
import MapView from './MapView.jsx';
import MathUtil from '../lib/MathUtil.js';
import MenuItem from 'material-ui/lib/menus/menu-item';
import NavigationMenu from 'material-ui/lib/svg-icons/navigation/menu';
import React from 'react';
import SearchBar from './SearchBar.jsx';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';

export default class App extends React.Component {
    constructor() {
        super();
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    state = {
        searchText: '',
        searchDataSource: [],
        map: {
            x: 0,
            y: 0,
            zoom: 0
        },
        dragData: {
            dragging: false
        }
    };

    handleSearchSubmit(input) {
        if (!!input) {
        }
    }

    handleTouchStart(event) {
        event.button = 0;
        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        this.handleMouseDown(event);
    }

    handleTouchMove(event) {
        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        this.handleMouseMove(event);
    }

    handleTouchEnd(event) {
        this.handleMouseUp(event);
    }

    handleMouseDown(event) {
        if (event.button == 0) {
            this.setState({
                dragData: {
                    dragging: true,
                    startX: this.state.map.x,
                    startY: this.state.map.y,
                    startMouseX: event.clientX,
                    startMouseY: event.clientY
                }
            });
            event.preventDefault();
        }
    }

    handleMouseMove(event) {
        if (this.state.dragData.dragging) {
            let dx = event.clientX - this.state.dragData.startMouseX;
            let dy = event.clientY - this.state.dragData.startMouseY;
            this.setState(//TODO:map....{x: this.state.dragData.startX - dx, y: this.state.dragData.startY - dy});
        }
        event.preventDefault();
    }

    handleMouseUp(event) {
        this.setState({dragData: {dragging: false}});
        event.preventDefault();
    }

    handleWheel(event) {
        let mapHelper = new MapHelper();
        let container = this.refs.container;
        let containerOffsetX = container.offsetLeft;
        let containerOffsetY = container.offsetTop;
        let parent = container.offsetParent;
        while (parent != null) {
            containerOffsetX += parent.offsetLeft;
            containerOffsetY += parent.offsetTop;
            parent = parent.offsetParent;
        }
        let alongX = MathUtil.norm(containerOffsetX, containerOffsetX + container.offsetWidth, event.clientX);
        let alongY = MathUtil.norm(containerOffsetY, containerOffsetY + container.offsetHeight, event.clientY);

        if (event.deltaY < 0 && this.state.map.zoom < mapHelper.maxZoom) {
            this.setState({
                map: {
                    zoom: this.state.map.zoom + 1,
                    x: this.state.map.x * 2 + container.offsetWidth * alongX,
                    y: this.state.map.y * 2 + container.offsetHeight * alongY
                }
            });
        }
        if (event.deltaY > 0 && this.state.map.zoom > mapHelper.minZoom) {
            this.setState({
                map: {
                    zoom: this.state.map.zoom - 1,
                    x: (this.state.map.x - container.offsetWidth * alongX) / 2,
                    y: (this.state.map.y - container.offsetHeight * alongY) / 2
                }
            });
        }

        event.preventDefault();
    }

    render() {
        return <div style={{width: '100%', height: '100%'}}>
            <Toolbar style={{position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto', zIndex: 1, boxShadow: '0px 3px 10px grey'}}>
                <ToolbarGroup float="left" firstChild={true} lastChild={true}>
                    <IconMenu iconButtonElement={<IconButton><NavigationMenu/></IconButton>}
                              targetOrigin={{horizontal: 'left', vertical: 'top'}}
                              anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}>
                        <MenuItem primaryText="Refresh"/>
                        <MenuItem primaryText="Help"/>
                        <MenuItem primaryText="Sign out"/>
                    </IconMenu>
                    <SearchBar style={{display: 'inline-block'}} onSubmit={this.handleSearchSubmit}/>
                </ToolbarGroup>
            </Toolbar>
            <div style={{width: '100%', height: '100%', zIndex: 0}}
                 onWheel={this.handleWheel}
                 onTouchStart={this.handleTouchStart}
                 onTouchMove={this.handleTouchMove}
                 onTouchEnd={this.handleTouchEnd}
                 onMouseDown={this.handleMouseDown}
                 onMouseMove={this.handleMouseMove}
                 onMouseUp={this.handleMouseUp}
                 ref="container">
                <MapView x={this.state.map.x} y={this.state.map.y} zoom={this.state.map.zoom}/>
            </div>
        </div>;
    }
};
