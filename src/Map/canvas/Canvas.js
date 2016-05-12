import Composition from './Composition';
import Group from './Group';
import ImageFrontier from './ImageFrontier';
import Picture from './Picture';
import React from 'react';
import Rectangle from './Rectangle';
import Rotate from './Rotate';
import Scale from './Scale';
import Transform from './Transform';
import Translate from './Translate';

export default class Canvas extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.draw;
        this.componentDidUpdate = this.draw;
    }

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        imageFrontier: React.PropTypes.instanceOf(ImageFrontier).isRequired
    };

    static defaultProps = {
        width: 0,
        height: 0,
        imageFrontier: new ImageFrontier()
    };

    state = {
        count: 0
    };

    draw() {
        let canvas = this.refs.canvas;
        let context = canvas.getContext('2d');
        this.props.imageFrontier.clear();
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
        if (this.props.imageFrontier.isLoaded(picture.props.source) && picture.props.display) {
            let image = this.props.imageFrontier.getLoadedImage(picture.props.source);
            context.drawImage(image, picture.props.left, picture.props.top, picture.props.width, picture.props.height);
        } else if (!picture.props.forceFromCache) {
            this.props.imageFrontier.fetch(picture.props.source);
            this.props.imageFrontier.setCallback(picture.props.source, () => this.setState({count: this.state.count + 1}));
        }
    }

    drawGroup(context, group) {
        React.Children.forEach(group.props.children, child => {
            if (!!child) {
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
                    case Composition:
                        this.drawComposition(context, child);
                        break;
                    default:
                        console.warn('Unknown child type for Canvas: ' + child.type);
                        break;
                }
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

    drawComposition(context, composition) {
        let oldCompositeOperation = context.globalCompositeOperation;
        context.globalCompositeOperation = composition.props.type;
        this.drawGroup(context, composition);
        context.globalCompositeOperation = oldCompositeOperation;
    }

    render() {
        return <canvas ref="canvas" {...this.props}>
            Your browser does not support the HTML5 canvas tag.
        </canvas>;
    }
};
