import Group from './Group';
import React from 'react';
import raf from 'raf';

export default class Canvas extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.tick = this.tick.bind(this);
        this.draw = this.draw.bind(this);
        this.lastTemplate = {};
        this.nextTemplate = {props: {type: Group, children: []}};
    }

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        width: 0,
        height: 0
    };

    componentDidMount() {
        this.tick();
    }

    shouldComponentUpdate(prevProps) {
        return this.props.width != prevProps.width
            || this.props.height != prevProps.height;
    }

    tick() {
        if (this.lastTemplate != this.nextTemplate) {
            let canvas = this.refs.canvas;
            let context = canvas.getContext('2d');
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, this.props.width, this.props.height);
            Group(this.nextTemplate.props).draw(context);
            this.lastTemplate = this.nextTemplate;
        }
        raf(this.tick);
    }

    draw(template) {
        this.nextTemplate = template;
    }

    render() {
        return <canvas ref="canvas" {...this.props}>
            Your browser does not support the HTML5 canvas tag.
        </canvas>;
    }
};
