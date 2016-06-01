import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import style from './style';
import FeaturesProvider from './FeaturesProvider';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

ReactDOM.render(
    <FeaturesProvider><App/></FeaturesProvider>,
    document.getElementById('react-main-mount')
);
