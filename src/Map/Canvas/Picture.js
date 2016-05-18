import React from 'react';
import objectAssign from 'object-assign';

const defaultProps = {
    left: 0,
    top: 0,
    width: 0,
    height: 0
};

export default function Picture(props) {
    const propsWithDefaults = objectAssign({}, defaultProps, props);
    
    return {
        draw: (context) => {
            context.drawImage(propsWithDefaults.image, propsWithDefaults.left, propsWithDefaults.top, propsWithDefaults.width, propsWithDefaults.height);
        }
    };
};
