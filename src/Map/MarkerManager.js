import ReactDOMServer from 'react-dom/server';

export default class MarkerManager {
    constructor() {
        this.sourceToImage = [];
    }

    reactElementToImage(name, element) {
        let content = ReactDOMServer.renderToStaticMarkup(element);
    }
};
