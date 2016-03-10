import React from 'react';

export default class Rectangle extends React.Component {
    render() {
        return <canvas {...this.props}>
            Your browser does not support the HTML5 canvas tag.
        </canvas>;
    }
};
