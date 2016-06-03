jest.unmock('../Cache');
jest.unmock('object-assign');

import Cache from '../Cache';

describe('Cache', () => {
    let canvas;
    let context = jasmine.createSpyObj('context', ['drawImage']);

    it('draws a canvas as an image to the context with default props', () => {
        Cache({}).draw(context);

        expect(context.drawImage).toHaveBeenCalled();

        let args = context.drawImage.calls.mostRecent().args;
        canvas = args[0];
        expect(args[1]).toBe(0);
        expect(args[2]).toBe(0);
        expect(args[3]).toBe(0);
        expect(args[4]).toBe(0);
    });

    it('draws the same canvas element when image id has not changed', () => {
        Cache({}).draw(context);

        expect(context.drawImage.calls.count()).toBe(2);

        let args = context.drawImage.calls.mostRecent().args;
        expect(args[0]).toBe(canvas);
        expect(args[1]).toBe(0);
        expect(args[2]).toBe(0);
        expect(args[3]).toBe(0);
        expect(args[4]).toBe(0);
    });

    it('draws a different canvas element when the image id has change', () => {
        Cache({imageId: 1}).draw(context);

        expect(context.drawImage.calls.count()).toBe(3);

        let args = context.drawImage.calls.mostRecent().args;
        expect(args[0]).not.toBe(canvas);
        expect(args[1]).toBe(0);
        expect(args[2]).toBe(0);
        expect(args[3]).toBe(0);
        expect(args[4]).toBe(0);
    });
});
