import React from 'react';
import Rectangle from './Rectangle.jsx';

export default class Canvas extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.draw;
        this.componentDidUpdate = this.draw;
    }

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        width: 0,
        height: 0
    };

    draw() {
        let canvas = this.refs.canvas;
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, this.props.width, this.props.height);

        React.Children.forEach(this.props.children, child => {
            switch (child.type) {
                case Rectangle:
                    this.drawRectangle(context, child);
                    break;
                default:
                    console.warn('Unknown child type for Canvas: ' + child.type);
                    break;
            }
        });
    }

    drawRectangle(context, rectangle) {
        context.beginPath();
        context.rect(rectangle.props.left, rectangle.props.top, rectangle.props.width, rectangle.props.height);
        context.fillStyle = rectangle.props.fillStyle;
        context.fill();
        context.strokeStyle = rectangle.props.strokeStyle;
        context.stroke();
        context.closePath();
    }

    render() {
        return <canvas ref="canvas" {...this.props}>
            Your browser does not support the HTML5 canvas tag.
        </canvas>;
    }
};
