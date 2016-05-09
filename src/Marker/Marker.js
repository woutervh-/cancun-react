import React from 'react';
import objectAssign from 'object-assign';

export default class Marker extends React.Component {
    constructor() {
        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
    }

    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        onTap: React.PropTypes.func.isRequired,
        anchor: React.PropTypes.oneOf([
            'top-left',
            'top-center',
            'top-right',
            'middle-left',
            'middle-center',
            'middle-right',
            'bottom-left',
            'bottom-center',
            'bottom-right'
        ]).isRequired
    };

    static defaultProps = {
        width: 0,
        height: 0,
        onTap: ()=> {
        },
        anchor: 'bottom-center'
    };

    componentDidMount() {
        this.hammer = new Hammer(this.refs.container);
        this.updateHammer(this.hammer);
    }

    componentDidUpdate() {
        if (this.hammer) {
            this.updateHammer(this.hammer);
        }
    }

    componentWillUnmount() {
        if (this.hammer) {
            this.hammer.stop();
            this.hammer.destroy();
        }
        this.hammer = null;
    }

    shouldComponentUpdate(nextProps) {
        return this.props.width != nextProps.width
            || this.props.height != nextProps.height
            || this.props.anchor != nextProps.anchor
            || this.props.onTap != nextProps.onTap
            || this.props.children != nextProps.children;
    }

    updateHammer(hammer) {
        hammer.off('tap');
        hammer.on('tap', this.props.onTap);
    }

    render() {
        return <div ref="container">
            {React.cloneElement(
                React.Children.only(this.props.children),
                {
                    viewBox: [0, 0, this.props.width, this.props.height].join(' '),
                    style: objectAssign({},
                        {
                            position: 'absolute',
                            bottom: 0,
                            marginLeft: 'calc(' + this.props.style.width + ' / -2)',
                            cursor: 'hand',
                            zIndex: 5
                        },
                        this.props.style)
                }
            )}
        </div>;
    }
};
