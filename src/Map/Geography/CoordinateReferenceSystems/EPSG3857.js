import Earth from './Earth';
import Transformation from '../../Transformation';
import {SphericalMercator} from '../Projections';

export default class EPSG3857 extends Earth {
    constructor() {
        super();

        let sphericalMercator = new SphericalMercator();
        this.project = sphericalMercator.project;
        this.unproject = sphericalMercator.unproject;
        this.bounds = sphericalMercator.bounds;

        let scale = 0.5 / (Math.PI * SphericalMercator.radius);
        let transformation = new Transformation(scale, 0.5, -scale, 0.5);
        this.transform = transformation.transform;
        this.untransform = transformation.untransform;
    }
};
