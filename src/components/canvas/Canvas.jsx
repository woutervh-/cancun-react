import ImageFrontier from '../../lib/canvas/ImageFrontier.js';
import Picture from './Picture.jsx';
import React from 'react';
import Rectangle from './Rectangle.jsx';

export default class Canvas extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.draw;
        this.componentDidUpdate = this.draw;
        this.imageFrontier = new ImageFrontier();
    }

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        width: 0,
        height: 0
    };

    state = {
        count: 0,
        pictures: {}
    };

    draw() {
        let canvas = this.refs.canvas;
        let context = canvas.getContext('2d');
        this.imageFrontier.clear();
        context.clearRect(0, 0, this.props.width, this.props.height);

        React.Children.forEach(this.props.children, child => {
            switch (child.type) {
                case Rectangle:
                    this.drawRectangle(context, child);
                    break;
                case Picture:
                    this.drawPicture(context, child);
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

    drawPicture(context, picture) {
        if (this.imageFrontier.isLoaded(picture.props.source)) {
            let image = this.imageFrontier.getLoadedImage(picture.props.source);
            context.drawImage(image, picture.props.left, picture.props.top, picture.props.width, picture.props.height);
        } else {
            this.imageFrontier.fetch(picture.props.source);
            this.imageFrontier.setCallback(picture.props.source, () => this.setState({count: this.state.count + 1}));
        }
    }

    render() {
        return <canvas ref="canvas" {...this.props}>
            Your browser does not support the HTML5 canvas tag.
        </canvas>;
    }
};
