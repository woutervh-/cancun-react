import React from 'react';
import Group from './Group';

const defaultProps = {
    scaleWidth: 1,
    scaleHeight: 1
};

export default function Scale(props) {
    const propsWithDefaults = objectAssign({}, defaultProps, props);
    
    return {
        draw: (context) => {
            context.save();
            context.scale(propsWithDefaults.scaleWidth, propsWithDefaults.scaleHeight);
            Group(props).draw(context);
            context.restore();
        }
    };
};
