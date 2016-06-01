import React from 'react';
import Modernizr from 'modernizr';

export default class FeaturesProvider extends React.Component {
    static propTypes = {
        children: React.PropTypes.element
    };

    static childContextTypes = {
        touchevents: React.PropTypes.bool.isRequired,
        pointerevents: React.PropTypes.bool.isRequired
    };
    
    getChildContext() {
        let context = {};
        for (let key in FeaturesProvider.childContextTypes) {
            context[key] = Modernizr[key];
        }
        return context;
    }

    render() {
        return this.props.children;
    }
};
