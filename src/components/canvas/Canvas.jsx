import React from 'react';

export default class Canvas extends React.Component {
    render() {
        console.log(this.props.children);

        return <canvas {...this.props}>
            Your browser does not support the HTML5 canvas tag.
        </canvas>;
    }
};
