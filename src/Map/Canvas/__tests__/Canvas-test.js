jest.unmock('../Canvas');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import Canvas from '../Canvas';

describe('Canvas', () => {
    it('renders a canvas element', () => {
        const canvas = TestUtils.renderIntoDocument(<Canvas width={1} height={2}/>);
        //canvas.componentWillUnmount();

        const canvasNode = ReactDOM.findDOMNode(canvas);

        expect(canvasNode).toEqual(jasmine.any(HTMLCanvasElement));
    });
});
