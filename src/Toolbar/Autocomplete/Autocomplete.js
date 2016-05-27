import React from 'react';
import {IconButton, Input, ListItem} from 'react-toolbox';
import style from './style';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';

export default class Autocomplete extends React.Component {
    constructor() {
        super();
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.calculateMaxHeight = this.calculateMaxHeight.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleItemMouseDown = this.handleItemMouseDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    static propTypes = {
        suggestions: React.PropTypes.array.isRequired,
        onUpdateInput: React.PropTypes.func.isRequired,
        onInputSubmit: React.PropTypes.func.isRequired
    };

    static defaultProps = {
        suggestions: [],
        onUpdateInput: () => {
        },
        onInputSubmit: () => {
        }
    };

    state = {
        query: '',
        index: -1,
        focus: false,
        maxHeight: 0
    };

    shouldComponentUpdate(nextProps, nextState) {
        return !(shallowEqual(this.props, nextProps) && shallowEqual(this.state, nextState));
    }

    componentDidMount() {
        let maxHeight = this.calculateMaxHeight();
        setImmediate(() => {
            this.setState({maxHeight});
        });
    }

    componentDidUpdate(prevProps) {
        let maxHeight = this.calculateMaxHeight();
        if (this.state.maxHeight != maxHeight) {
            setImmediate(() => {
                this.setState({maxHeight});
            });
        }

        if(this.props.suggestions != prevProps.suggestions) {
            this.setState({index: -1});
        }
    }

    calculateMaxHeight() {
        let element = this.refs.suggestions;
        let elementOffset = {x: element.offsetLeft, y: element.offsetTop};
        let parent = element.offsetParent;
        while (parent != null) {
            elementOffset.x += parent.offsetLeft;
            elementOffset.y += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return window.innerHeight - elementOffset.y;
    }


    submit() {
        this.props.onInputSubmit(this.state.query, this.state.index);
    }

    handleChange(input) {
        this.setState({query: input, index: -1});
        this.props.onUpdateInput(input);
    }

    handleBlur() {
        this.setState({focus: false});
    }

    handleFocus() {
        this.setState({focus: true});
    }

    handleItemMouseDown(index) {
        this.setState({query: this.props.suggestions[index], focus: false, index}, () => {
            this.refs.input.blur();
            this.submit();
        });
    }

    handleKeyUp(event) {
        switch (event.which) {
            /* Enter key */
            case 13:
                if (this.state.index >= 0 && this.state.index < this.props.suggestions.length) {
                    this.setState({query: this.props.suggestions[this.state.index], focus: false}, () => this.refs.input.blur());
                } else {
                    this.setState({focus: false}, () => this.refs.input.blur());
                }
                this.submit();
                break;
            /* Escape key */
            case 27:
                this.setState({focus: false}, () => this.refs.input.blur());
                break;
            /* Up/down arrow keys */
            case 38:
            case 40:
                let index = this.state.index + (event.which == 38 ? -1 : 1);
                if (index >= 0 && index < this.props.suggestions.length) {
                    this.setState({index});
                }
                break;
            default:
                break;
        }
    }

    render() {
        let {suggestions, onUpdateInput, onInputSubmit, ...other} = this.props;

        return <Input
            {...other}
            ref="input"
            type="search"
            value={this.state.query}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            onKeyUp={this.handleKeyUp}
            floating={false}>
            <div
                ref="suggestions"
                className={classNames(style['suggestions'], {[style['active']]: this.state.focus && suggestions.length >= 1})}
                style={{maxHeight: this.state.maxHeight}}>
                {suggestions.map((item, index) =>
                    <ListItem
                        key={index}
                        ripple={false}
                        className={classNames(style['suggestions-item'], {[style['active']]: this.state.index == index})}
                        itemContent={<span>{item}</span>}
                        onMouseDown={this.handleItemMouseDown.bind(this, index)}/>
                )}
            </div>
            <IconButton icon="clear" type="button" onClick={this.handleClearClick} className={style['toolbar-item']}/>
        </Input>;
    }
};
