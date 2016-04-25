import React from 'react';

export default class Composition extends React.Component {
    static propTypes = {
        type: React.PropTypes.string.isRequired
    };

    static defaultProps = {
        type: 'source-over'
    };
};
