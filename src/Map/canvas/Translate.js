import React from 'react';
import Group from './Group';
import objectAssign from 'object-assign';

const defaultProps = {
    x: 0,
    y: 0
};

export default function Translate(props) {
    const propsWithDefaults = objectAssign({}, defaultProps, props);

    return {
        draw: (context) => {
            context.save();
            context.translate(propsWithDefaults.x, propsWithDefaults.y);
            Group(props).draw(context);
            context.restore();
        }
    };
};
