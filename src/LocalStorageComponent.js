import React from 'react';

export default class LocalStorageComponent extends React.Component {
    setPersistenceKey(key) {
        this.key = key;
    }

    restoreState() {
        if (!!localStorage[this.key]) {
            super.setState(JSON.parse(localStorage[this.key]));
        }
    }

    setState(nextState, callback) {
        super.setState(nextState, () => {
            localStorage[this.key] = JSON.stringify(this.state);
            if (!!callback) {
                callback();
            }
        });
    }
};
