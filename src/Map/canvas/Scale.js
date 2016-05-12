import React from 'react';

export default class Scale extends React.Component {
    static propTypes = {
        scaleWidth: React.PropTypes.number.isRequired,
        scaleHeight: React.PropTypes.number.isRequired
    };

    static defaultProps = {
        scaleWidth: 1,
        scaleHeight: 1
    };
};
