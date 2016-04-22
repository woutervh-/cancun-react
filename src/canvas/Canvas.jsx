import Group from './Group.jsx';
import ImageFrontier from './ImageFrontier.js';
import Picture from './Picture.jsx';
import React from 'react';
import Rectangle from './Rectangle.jsx';
import Scale from './Scale.jsx';
import Rotate from './Rotate.jsx';
import Translate from './Translate.jsx';
import Transform from './Transform.jsx';

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
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, this.props.width, this.props.height);
        this.drawGroup(context, this);
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

    drawGroup(context, group) {
        React.Children.forEach(group.props.children, child => {
            switch (child.type) {
                case Rectangle:
                    this.drawRectangle(context, child);
                    break;
                case Picture:
                    this.drawPicture(context, child);
                    break;
                case Group:
                    this.drawGroup(context, child);
                    break;
                case Scale:
                    this.drawScale(context, child);
                    break;
                case Rotate:
                    this.drawRotate(context, child);
                    break;
                case Translate:
                    this.drawTranslate(context, child);
                    break;
                case Transform:
                    this.drawTransform(context, child);
                    break;
                default:
                    console.warn('Unknown child type for Canvas: ' + child.type);
                    break;
            }
        });
    }

    drawScale(context, scale) {
        context.save();
        context.scale(scale.props.scaleWidth, scale.props.scaleHeight);
        this.drawGroup(context, scale);
        context.restore();
    }

    drawRotate(context, rotate) {
        context.save();
        context.rotate(rotate.props.angle);
        this.drawGroup(context, rotate);
        context.restore();
    }

    drawTranslate(context, translate) {
        context.save();
        context.translate(translate.props.x, translate.props.y);
        this.drawGroup(context, translate);
        context.restore();
    }

    drawTransform(context, transform) {
        context.save();
        if (transform.props.reset) {
            context.setTransform(transform.props.a, transform.props.b, transform.props.c, transform.props.d, transform.props.e, transform.props.f);
        } else {
            context.transform(transform.props.a, transform.props.b, transform.props.c, transform.props.d, transform.props.e, transform.props.f);
        }
        this.drawGroup(context, transform);
        context.restore();
    }

    render() {
        return <canvas ref="canvas" {...this.props}>
            Your browser does not support the HTML5 canvas tag.
        </canvas>;
    }
};
