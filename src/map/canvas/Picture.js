import React from 'react';

export default class Picture extends React.Component {
    static propTypes = {
        left: React.PropTypes.number.isRequired,
        top: React.PropTypes.number.isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        source: React.PropTypes.string.isRequired,
        forceFromCache: React.PropTypes.bool.isRequired,
        display: React.PropTypes.bool.isRequired
    };

    static defaultProps = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        forceFromCache: false,
        display: true
    };
};
