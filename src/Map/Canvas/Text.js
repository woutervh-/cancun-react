import objectAssign from 'object-assign';

const defaultProps = {
    font: '12px Arial',
    text: '',
    x: 0,
    y: 0
};

export default function Text(props) {
    const propsWithDefaults = objectAssign({}, defaultProps, props);

    return {
        draw: (context) => {
            let oldFont = context.font;
            let oldFillStyle = context.fillStyle;
            context.font = propsWithDefaults.font;
            context.fillStyle = 'black';
            context.fillText(propsWithDefaults.text, propsWithDefaults.x, propsWithDefaults.y);
            context.font = oldFont;
            context.fillStyle = oldFillStyle;
        }
    };
};
