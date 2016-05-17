import Group from './Group';
import React from 'react';
import raf from 'raf';

export default class Canvas extends React.Component {
    constructor() {
        super();
        this.draw = this.draw.bind(this);
    }

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        width: 0,
        height: 0
    };

    shouldComponentUpdate(prevProps) {
        return this.props.width != prevProps.width
            || this.props.height != prevProps.height;
    }

    draw(template) {
        raf(() => {
            let canvas = this.refs.canvas;
            let context = canvas.getContext('2d');
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, this.props.width, this.props.height);
            Group(template.props).draw(context);
        });
    }

    render() {
        return <canvas ref="canvas" {...this.props}>
            Your browser does not support the HTML5 canvas tag.
        </canvas>;
    }
};
