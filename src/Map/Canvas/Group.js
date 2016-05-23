import Composition from './Composition';
import Picture from './Picture';
import Rectangle from './Rectangle';
import Rotate from './Rotate';
import Scale from './Scale';
import Transform from './Transform';
import Translate from './Translate';

export default function Group(props) {
    return {
        draw: (context) => {
            if (!!props.children) {
                (Array.isArray(props.children) ? props.children : [props.children]).forEach(child => {
                    if (!!child) {
                        switch (child.type) {
                            case Composition:
                                Composition(child.props).draw(context);
                                break;
                            case Group:
                                Group(child.props).draw(context);
                                break;
                            case Picture:
                                Picture(child.props).draw(context);
                                break;
                            case Rectangle:
                                Rectangle(child.props).draw(context);
                                break;
                            case Rotate:
                                Rotate(child.props).draw(context);
                                break;
                            case Scale:
                                Scale(child.props).draw(context);
                                break;
                            case Transform:
                                Transform(child.props).draw(context);
                                break;
                            case Translate:
                                Translate(child.props).draw(context);
                                break;
                            default:
                                console.warn('Unknown child type for Canvas: ' + child.type);
                                break;
                        }
                    }
                });
            }
        }
    };
};
