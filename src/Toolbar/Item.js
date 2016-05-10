import React from 'react';

export default class Item extends React.Component {
    /* TODO: modularize*/

    render() {
        return <span>
            <IconButton><MapInactive viewBox="0 0 30 30"/> Map</IconButton>
            <Card style={{position: 'absolute'}}>
                <CardText>
                    <RadioGroup name="map" value={this.state.map} onChange={this.handleMapSelect}>
                        <RadioButton label="Day" value="day"/>
                        <RadioButton label="Night" value="night"/>
                    </RadioGroup>
                </CardText>
            </Card>
        </span>;
    }
};
