import React from 'react';

export default class Transform extends React.Component {
    static propTypes = {
        reset: React.PropTypes.bool.isRequired,
        a: React.PropTypes.number.isRequired,
        b: React.PropTypes.number.isRequired,
        c: React.PropTypes.number.isRequired,
        d: React.PropTypes.number.isRequired,
        e: React.PropTypes.number.isRequired,
        f: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        reset: false,
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0
    };
};
