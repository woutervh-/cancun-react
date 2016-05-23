import objectAssign from 'object-assign';

const defaultProps = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    strokeStyle: 'rgba(0, 0, 0, 1)',
    fillStyle: 'rgba(255, 255, 255, 0)'
};

export default function Rectangle(props) {
    const propsWithDefaults = objectAssign({}, defaultProps, props);

    return {
        draw: (context) => {
            context.beginPath();
            context.rect(propsWithDefaults.left, propsWithDefaults.top, propsWithDefaults.width, propsWithDefaults.height);
            context.fillStyle = propsWithDefaults.fillStyle;
            context.fill();
            context.strokeStyle = propsWithDefaults.strokeStyle;
            context.stroke();
            context.closePath();
        }
    };
};
