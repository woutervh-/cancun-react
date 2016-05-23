import React from 'react';

export default class HtmlLayer extends React.Component {
    static propTypes = {
        position: React.PropTypes.shape({
            latitude: React.PropTypes.number.isRequired,
            longitude: React.PropTypes.number.isRequired
        }).isRequired
    };

    render() {
        return null;
    }
};
