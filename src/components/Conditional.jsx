import React from 'react';

export default class Conditional extends React.Component {
    static propTypes = {
        condition: React.PropTypes.bool.isRequired,
        children: React.PropTypes.func.isRequired
    };

    render() {
        if (this.props.condition) {
            return this.props.children();
        } else {
            return null;
        }
    }
}
