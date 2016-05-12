import React from 'react';

export default class LocalStorageComponent extends React.Component {
    setPersistenceKey(key) {
        this.key = key;
    }

    setStateMapping(mapping) {
        this.mapping = mapping;
    }

    restoreState() {
        if (!!localStorage[this.key]) {
            super.setState(JSON.parse(localStorage[this.key]));
        }
    }

    setState(nextState, callback) {
        super.setState(nextState, () => {
            localStorage[this.key] = JSON.stringify(!!this.mapping ? this.mapping(this.state) : this.state);
            if (!!callback) {
                callback();
            }
        });
    }
};
