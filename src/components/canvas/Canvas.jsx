import React from 'react';

export default class Canvas extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.draw;
        this.componentDidUpdate = this.draw;
    }

    draw() {
        let canvas = this.refs.canvas;
        let context = canvas.getContext('2d');
        context.fillStyle = 'blue';
        context.fillRect(0, 0, 100, 50);
    }

    render() {
        return <canvas ref="canvas" {...this.props}>
            Your browser does not support the HTML5 canvas tag.
        </canvas>;
    }
};
