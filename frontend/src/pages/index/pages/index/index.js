import './index.css';

import React, { useEffect, useState } from 'react';

import { Bus as BusIcon, Train as TrainIcon } from '../../../../svg';

const transportColors = {
    bus: 'rgb(118, 163, 0)',
    fat_bus: 'rgb(230, 0, 0)',
    train: 'rgb(0, 48, 135)',
};

const transportIcons = {
    bus: BusIcon,
    fat_bus: BusIcon,
    train: TrainIcon,
};

function fillEmptyDate(num) {
    const str = num.toString();
    if (str.length === 1) {
        return `0${str}`
    } else {
        return str;
    }
}

function getHourMinDate(date) {
    return `${fillEmptyDate(date.getHours())}:${fillEmptyDate(date.getMinutes())}`
}

function TransportId({ transportType, transportNumber }) {
    return (
        <div className='transport_id' style={{ '--transport-id-col': transportColors[transportType] }}>
            <div className='transport_id_icon'>
                {React.createElement(transportIcons[transportType])}
            </div>
            <div className='transport_id_number'>
                {transportNumber}
            </div>
        </div>
    );
}

function TransportIdLabeled({ transportType, transportNumber, label }) {
    return (
        <div className='transport_id_labeled'>
            <TransportId transportType={transportType} transportNumber={transportNumber} />
            <div className='transport_id_labeled_label'>
                {label}
            </div>
        </div>
    );

}

function JourneyPlannerPlaceInput({ name, label, icons }) {
    return (
        <div className='journey_planner_form_place_input'>
            <label className='journey_planner_form_place_input_label'>
                {label}
            </label>
            <div className='journey_planner_form_place_input_container'>
                <input type='text' name={name} placeholder='Place, address, area' className='journey_planner_form_place_input_input_field' />
                <div className='journey_planner_form_place_input_icons'>
                    {icons?.map((icon) => {
                        return React.createElement(icon);
                    })}
                </div>
            </div>
        </div>
    )
}

export default function Index() {
    const [departures, setDepartures] = useState();

    useEffect(() => {
        fetch('https://api.entur.io/journey-planner/v3/graphql', {
            method: 'POST',
            headers: {
                'ET-Client-Name': 'joe_biden',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `{
                    stopPlace(id: "NSR:StopPlace:4977") {
                        name
                        id
                        estimatedCalls(numberOfDepartures: 12, whiteListedModes: [bus]) {
                            expectedDepartureTime
                            aimedDepartureTime
                            destinationDisplay {
                                frontText
                            }
                            serviceJourney {
                                line {
                                    publicCode
                                    transportMode
                                }
                            }
                        }
                    }
                }`,
            }),
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    setDepartures(data);
                });
            }
        });
    }, []);

    return (
        <div id='journey_planner'>
            <div id='journey_planner_planner'>
                <div id='journey_planner_planner_form_container'>
                    <form id='journey_planner_planner_form'>
                        <div id='journey_planner_planner_form_place_inputs'>
                            <JourneyPlannerPlaceInput name='from' label='From' icons={[BusIcon, TrainIcon]} />
                            <JourneyPlannerPlaceInput name='to' label='To' icons={[BusIcon, TrainIcon]} />
                        </div>
                    </form>
                </div>
                <div id='departures_container'>
                    <div id='departures'>
                        {departures ? departures.data.stopPlace.estimatedCalls.map((departure, index) => {
                            const expectedDepartureTime = new Date(departure.expectedDepartureTime);
                            const aimedDepartureTime = new Date(departure.aimedDepartureTime);
                            return (
                                <div key={index} className='departure'>
                                    <div className='departure_top_info'>
                                        <div className='departure_top_info_expected_time departure_top_info_time'>
                                            {getHourMinDate(new Date(departure.expectedDepartureTime))}
                                        </div>
                                        {expectedDepartureTime.valueOf() !== aimedDepartureTime.valueOf() ? (
                                            <div className='departure_top_info_aimed_time departure_top_info_time'>
                                                {getHourMinDate(new Date(departure.aimedDepartureTime))}
                                            </div>
                                        ) : undefined}
                                    </div>
                                    <div className='departure_content_info'>
                                        <TransportIdLabeled transportType={departure.serviceJourney.line.transportMode} transportNumber={departure.serviceJourney.line.publicCode} label={departure.destinationDisplay.frontText} />
                                    </div>
                                </div>
                            );
                        }) : undefined}
                    </div>
                </div>
            </div>
        </div>
    );
}