import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Injector, ReactIcon, TwoFingerZoom} from './LeafletPlugins';
import style from './style';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

Injector.inject(ReactIcon, TwoFingerZoom);

ReactDOM.render(
    <App/>,
    document.getElementById('react-main-mount')
);
