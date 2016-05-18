import React from 'react';
import Group from './Group';
import objectAssign from 'object-assign';

const defaultProps = {
    angle: 0
};

export default function Rotate(props) {
    const propsWithDefaults = objectAssign({}, defaultProps, props);
    
    return {
        draw: (context) => {
            context.save();
            context.rotate(propsWithDefaults.angle);
            Group(props).draw(context);
            context.restore();
        }
    };
};
