import React from 'react';
import shallowEqual from 'shallowequal';

export default class HtmlLayer extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
    }

    static propTypes = {
        position: React.PropTypes.shape({
            latitude: React.PropTypes.number.isRequired,
            longitude: React.PropTypes.number.isRequired
        }).isRequired,
        offset: React.PropTypes.shape({
            x: React.PropTypes.number.isRequired,
            y: React.PropTypes.number.isRequired
        })
    };

    shouldComponentUpdate(nextProps) {
        return !shallowEqual(this.props, nextProps);
    }

    render() {
        let {position, offset, children, ...other} = this.props;
        return <div style={{position: 'absolute', top: offset.y, left: offset.x}} {...other}>
            {children}
        </div>;
    }
};
