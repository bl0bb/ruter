import './index.css';

import { useEffect, useState } from 'react';

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

export default function Index() {
    const [departures, setDepartures] = useState();

    useEffect(() => {
        fetch('https://api.entur.io/journey-planner/v2/graphql', {
            method: 'POST',
            headers: {
                'ET-Client-Name': 'philip',
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
                    console.log("monkey")
                    setDepartures(data);
                });
            }
        });
    }, []);

    return (
        <div id='navigation_container'>
            <div id='departures'>
                {departures ? departures.data.stopPlace.estimatedCalls.map((departure, index) => {
                    return (
                        <div key={index} className='departure'>
                            <div className='departure_simple_info'>
                                <div className='departure_simple_info_line'>
                                    {departure.serviceJourney.line.publicCode}
                                </div>
                                <div className='departure_simple_info_time'>
                                    {getHourMinDate(new Date(departure.aimedDepartureTime))}
                                </div>
                            </div>
                            <div className='departure_info'>
                                <div className='departure_name'>
                                    {departure.destinationDisplay.frontText}
                                </div>
                            </div>
                        </div>
                    );
                }) : undefined}
            </div>
        </div>
    );
}