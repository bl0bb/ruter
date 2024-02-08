import './index.css';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import { Bus as BusIcon, Train as TrainIcon, PointPin as PointPinIcon, Tram as TramIcon, Subway as SubwayIcon, Boat as BoatIcon } from '../../../../svg';

const journeyPlannerContext = createContext();

const transportColors = {
    bus: 'rgb(118, 163, 0)',
    coach: 'rgb(230, 0, 0)',
    rail: 'rgb(0, 48, 135)',
    tram: 'rgb(0, 255, 0)',
    boat: 'rgb(0, 255, 255)',
};

const transportIcons = {
    bus: BusIcon,
    coach: BusIcon,
    bus_station: () => <div>🚏</div>,
    rail: TrainIcon,
    tram: TramIcon,
    subway: SubwayIcon,
    boat: BoatIcon,
    airport: () => <div>🛫</div>,
};

const transportationCategories = {
    'onstreetBus': 'bus',
    'onstreetTram': 'tram',
    'busStation': 'bus_station',
    'railStation': 'rail',
    'metroStation': 'subway',
    'harbourPort': 'boat',
    'airport': 'airport',
};

const locationIcons = {
    'street': PointPinIcon,
    'restaurant': () => <div>🧑‍🍳</div>,
    'poi': () => <div>🌱</div>,
    'places': () => <div>🏠</div>,
    'town': () => <div>🏠🏠🏠</div>,
    'attraction': () => <div>🎡</div>,
    'theatre': () => <div>🎭</div>,
    'cinema': () => <div>🎥</div>,
    'busStation': () => <div>🚌</div>,
    'airport': () => <div>🛫</div>,
    'hotel': () => <div>🏨</div>,
};

const locationCategories = {
    'street': 'street',
    'restaurant': 'restaurant',
    'poi': 'poi',
    'GroupOfStopPlaces': 'places',
    'tettsted': 'town',
    'theatre': 'theatre',
    'cinema': 'cinema',
    'attraction': 'attraction',
    'busStation': 'busStation',
    'airport': 'airport',
    'hotel': 'hotel',
};

function removeDuplicates(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

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

function RawTransportId({ transportColor, transportType, content }) {
    return (
        <div className='transport_id' style={{ '--transport-id-col': `#${transportColor}` }}>
            <div className='transport_id_icon'>
                {React.createElement(transportIcons[transportType])}
            </div>
            {content}
        </div>
    );
}

function TransportId({ transportColor, transportType, transportNumber }) {
    return (
        <RawTransportId transportColor={transportColor} transportType={transportType} content={(
            <div className='transport_id_number'>
                {transportNumber}
            </div>
        )} />
    );
}

function WalkTransportId() {
    return (
        <div className='transport_id'>
            <div className='transport_id_icon'>
                🚶
            </div>
        </div>
    );
}

function TransportIdLabeled({ transportColor, transportType, transportNumber, label }) {
    return (
        <div className='transport_id_labeled'>
            <TransportId transportColor={transportColor} transportType={transportType} transportNumber={transportNumber} />
            <div className='transport_id_labeled_label'>
                {label}
            </div>
        </div>
    );

}

function JourneyPlannerPlaceInput({ name, label, icons, searchInput, setSearchInput, setLocation }) {
    const [suggestions, setSuggestions] = useState();
    const [isFocused, setIsFocused] = useState(false);
    const selectRef = useRef();

    const updateSuggestions = (newSuggestions) => {
        setSuggestions(newSuggestions);
    }

    const fetchNewSuggestions = () => {
        const query = searchInput;
        if (query === '') {
            updateSuggestions();
            return;
        }

        const abortController = new AbortController();

        const url = new URL('https://api.entur.io/geocoder/v1/autocomplete');
        const searchParams = new URLSearchParams();
        searchParams.append('text', query);
        searchParams.append('lang', 'en');
        url.search = searchParams;
        fetch(url.toString(), {
            signal: abortController.signal,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    updateSuggestions(data);
                });
            } else {
                console.warn('Failed to fetch suggestions', res);
            }
        });

        return () => {
            abortController.abort();
        }
    }

    useEffect(() => {
        fetchNewSuggestions();
    }, [searchInput]);

    useEffect(() => {
        const curSelect = selectRef.current;
        if (curSelect) {
            const focusHandler = (e) => {
                if (curSelect.contains(e.target)) {
                    setIsFocused(true);
                }
            }

            const blurHandler = (e) => {
                if (!curSelect.contains(e.relatedTarget)) {
                    setIsFocused(false);
                }
            }

            document.addEventListener('focus', focusHandler, true);
            document.addEventListener('blur', blurHandler, true);

            return () => {
                document.removeEventListener('focus', focusHandler, true);
                document.removeEventListener('blur', blurHandler, true);
            }
        }
    });

    const displaySuggestions = isFocused && suggestions?.features.length > 0;

    return (
        <div className='journey_planner_form_place_input'>
            <label className='journey_planner_form_place_input_label'>
                {label}
            </label>
            <div ref={selectRef} className='journey_planner_form_place_input_container'>
                <div className={`journey_planner_form_place_input_main${displaySuggestions ? ' journey_planner_form_place_input_main_focused' : ''}`}>
                    <input type='text' name={name} placeholder='Place, address, area' className='journey_planner_form_place_input_input_field' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                    <div className='journey_planner_form_place_input_icons'>
                        {icons?.map((icon, index) => {
                            return React.createElement(icon, { key: index });
                        })}
                    </div>
                </div>
                <div className={`journey_planner_form_place_input_suggestions${displaySuggestions ? ' journey_planner_form_place_input_suggestions_focused' : ''}`}>
                    {suggestions?.features.map((suggestion, index) => {
                        const categories = suggestion.properties.category;
                        const layer = suggestion.properties.layer;

                        return (
                            <button key={index} type='button' className='journey_planner_form_place_input_suggestion' onClick={(e) => setLocation(suggestion)}>
                                <div className='journey_planner_form_place_input_suggestion_info'>
                                    <div className='journey_planner_form_place_input_suggestion_name'>
                                        {suggestion.properties.name}
                                    </div>
                                    <div className='journey_planner_form_place_input_suggestion_location'>
                                        {suggestion.properties.county}, {suggestion.properties.locality}
                                    </div>
                                </div>
                                <div className='journey_planner_form_place_input_suggestion_icons'>
                                    {layer === 'venue' ? removeDuplicates(categories).map((category) => {
                                        return React.createElement(transportIcons[transportationCategories[category]]);
                                    }) : React.createElement(PointPinIcon)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

//drømp 4977
//oslo 59872
//NSR:StopPlace:593258//change num with id


function generateDeparturesQuery(stopPlace) {
    return {
        query: `{
            stopPlace(id: "${stopPlace}") {
                name
                id
                estimatedCalls(numberOfDepartures: 12, whiteListedModes: [bus, rail]) {
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
        variables: {},
    };
}

/*
//place this in "from" or "to" in generatePlanQuery instead of "place"
coordinates: {
    latitude: 59.96050414081307
    longitude: 11.040338686322317
}
*/

function generatePlanQuery(from, to) {
    return {
        operationName: 'trips',
        query: `query trips($from: Location!, $to: Location!, $dateTime: DateTime!, $arriveBy: Boolean!, $preferred: InputPreferred, $modes: [Mode], $minimumTransferTime: Int, $banned: InputBanned, $whiteListed: InputWhiteListed, $transportSubmodes: [TransportSubmodeFilter], $numTripPatterns: Int = 8, $walkSpeed: Float = 1.3, $walkReluctance: Float = 4.0) {
            trip(from: $from, to: $to, dateTime: $dateTime, arriveBy: $arriveBy, preferred: $preferred, modes: $modes, minimumTransferTime: $minimumTransferTime, banned: $banned, whiteListed: $whiteListed, transportSubmodes: $transportSubmodes, numTripPatterns: $numTripPatterns, walkReluctance: $walkReluctance, walkSpeed: $walkSpeed, transferPenalty: 0, ignoreRealtimeUpdates: true) {
              tripPatterns {
                startTime
                endTime
                duration
                legs {
                  aimedStartTime
                  expectedStartTime
                  aimedEndTime
                  expectedEndTime
                  mode
                  realtime
                  distance
                  serviceJourney {
                    ...serviceJourneyFragment
                    __typename
                  }
                  pointsOnLink {
                    points
                    __typename
                  }
                  fromEstimatedCall {
                    ...estimatedCallWithQuayFragment
                    __typename
                  }
                  toEstimatedCall {
                    ...estimatedCallWithQuayFragment
                    __typename
                  }
                  intermediateEstimatedCalls {
                    ...estimatedCallWithQuayFragment
                    __typename
                  }
                  situations {
                    ...situationFragment
                    __typename
                  }
                  __typename
                }
                __typename
              }
              __typename
            }
          }
          
          fragment serviceJourneyFragment on ServiceJourney {
            id
            privateCode
            line {
              ...lineFragment
              __typename
            }
            situations {
              ...situationFragment
              __typename
            }
            wheelchairAccessible
            notices {
              id
              text
              publicCode
              __typename
            }
            __typename
          }
          
          fragment estimatedCallFragment on EstimatedCall {
            quay {
              id
              __typename
            }
            aimedArrivalTime
            expectedArrivalTime
            actualArrivalTime
            aimedDepartureTime
            expectedDepartureTime
            actualDepartureTime
            realtime
            forBoarding
            forAlighting
            cancellation
            date
            destinationDisplay {
              frontText
              __typename
            }
            situations {
              ...situationFragment
              __typename
            }
            notices {
              id
              text
              publicCode
              __typename
            }
            __typename
          }
          
          fragment estimatedCallWithQuayFragment on EstimatedCall {
            ...estimatedCallFragment
            quay {
              ...quayFragment
              __typename
            }
            __typename
          }
          
          fragment lineFragment on Line {
            id
            publicCode
            transportMode
            presentation {
              colour
              textColour
              __typename
            }
            notices {
              id
              text
              publicCode
              __typename
            }
            authority {
              id
              name
              __typename
            }
            situations {
              ...situationFragment
              __typename
            }
            __typename
          }
          
          fragment quayFragment on Quay {
            id
            name
            latitude
            longitude
            description
            publicCode
            wheelchairAccessible
            stopPlace {
              id
              description
              transportMode
              tariffZones {
                ...tariffZoneFragment
                __typename
              }
              parent {
                id
                description
                __typename
              }
              __typename
            }
            __typename
          }
          
          fragment situationFragment on PtSituationElement {
            id
            situationNumber
            summary {
              ...multilingualStringFragment
              __typename
            }
            description {
              ...multilingualStringFragment
              __typename
            }
            advice {
              ...multilingualStringFragment
              __typename
            }
            lines {
              id
              publicCode
              presentation {
                colour
                textColour
                __typename
              }
              transportMode
              __typename
            }
            quays {
              id
              name
              stopPlace {
                id
                name
                parent {
                  id
                  name
                  __typename
                }
                __typename
              }
              __typename
            }
            stopPlaces {
              id
              name
              __typename
            }
            validityPeriod {
              startTime
              endTime
              __typename
            }
            infoLinks {
              uri
              label
              __typename
            }
            __typename
          }
          
          fragment multilingualStringFragment on MultilingualString {
            value
            language
            __typename
          }
          
          fragment tariffZoneFragment on TariffZone {
            id
            name
            __typename
          }
          `,
        variables: {
            "numTripPatterns": 5,
            "walkSpeed": 1.3055555555555556,
            "walkReluctance": 4,
            "from": {
                "place": `${from}`,
                /*
                "coordinates": {
                    "longitude": 10.833673,
                    "latitude": 59.718294
                }
                */
            },
            "to": {
                "place": `${to}`,
                /*
                "coordinates": {
                    "longitude": 10.867490917569125,
                    "latitude": 59.71592252026583
                }
                */
            },
            "dateTime": new Date().toISOString(),
            "arriveBy": false,
            "modes": [
                "coach",
                "bus",
                "metro",
                "tram",
                "rail",
                "water",
                "foot"
            ],
            "transportSubmodes": [],
            "minimumTransferTime": 0,
            "preferred": null,
            "banned": null
        }
    };
}

function JourneyPlannerForm() {
    const { planFromSearchInput, setPlanFromSearchInput, planToSearchInput, setPlanToSearchInput, setPlanToLocation, setPlanFromLocation } = useContext(journeyPlannerContext);
    return (
        <form id='journey_planner_planner_form'>
            <h2 id='journey_planner_form_title'>
                Where do you want to go?
            </h2>
            <div id='journey_planner_planner_form_place_inputs'>
                <JourneyPlannerPlaceInput name='from' label='From' icons={[BusIcon, TrainIcon]} searchInput={planFromSearchInput} setSearchInput={setPlanFromSearchInput} setLocation={setPlanFromLocation} />
                <JourneyPlannerPlaceInput name='to' label='To' icons={[BusIcon, TrainIcon]} searchInput={planToSearchInput} setSearchInput={setPlanToSearchInput} setLocation={setPlanToLocation} />
            </div>
        </form>
    );
}

function DeparturesForm() {
    const { departuresFromInput, setDeparturesFromInput, departuresLocation, setDeparturesLocation } = useContext(journeyPlannerContext);
    return (
        <form id='journey_planner_planner_form'>
            <h2 id='journey_planner_form_title'>
                Where do you want to travel from?
            </h2>
            <JourneyPlannerPlaceInput name='from' label='From' icons={[BusIcon, TrainIcon]} searchInput={departuresFromInput} setSearchInput={setDeparturesFromInput} setLocation={setDeparturesLocation} />
        </form>
    );
}

function JourneyPlanner({ selectedForm, setSelectedForm, planFromSearchInput, setPlanFromSearchInput, planToSearchInput, setPlanToSearchInput, planToLocation, setPlanToLocation, planFromLocation, setPlanFromLocation, departuresFromInput, setDeparturesFromInput, departuresLocation, setDeparturesLocation }) {
    const forms = {
        journey_planner: {
            id: 'journey_planner',
            name: 'Journey Planner',
            form: JourneyPlannerForm,
        },
        departures: {
            id: 'departures',
            name: 'Departures',
            form: DeparturesForm,
        },
    };

    return (
        <journeyPlannerContext.Provider value={{ planFromSearchInput, setPlanFromSearchInput, planToSearchInput, setPlanToSearchInput, planToLocation, setPlanToLocation, planFromLocation, setPlanFromLocation, departuresFromInput, setDeparturesFromInput, departuresLocation, setDeparturesLocation }}>
            <div id='journey_planner_planner_form_display'>
                <div id='journey_planner_planner_form_display_select'>
                    {Object.values(forms).map((form, index) => {
                        return (
                            <div key={index} className={`journey_planner_form_display_select_button${selectedForm === form.id ? ' journey_planner_form_display_select_button_selected' : ''}`} onClick={() => setSelectedForm(form.id)}>
                                {form.name}
                            </div>
                        );
                    })}
                </div>
                <div id='journey_planner_planner_form_container'>
                    {React.createElement(forms[selectedForm].form)}
                </div>
            </div>
        </journeyPlannerContext.Provider>
    );
}

export default function Index() {
    const [curDeparturesQuery, setCurDeparturesQuery] = useState();
    const [curPlanQuery, setCurPlanQuery] = useState();

    const [departures, setDepartures] = useState();
    const [plans, setPlans] = useState();

    const [selectedForm, setSelectedForm] = useState('journey_planner');

    const [planFromSearchInput, setPlanFromSearchInput] = useState('');
    const [planToSearchInput, setPlanToSearchInput] = useState('');
    const [planFromLocation, setPlanFromLocation] = useState();
    const [planToLocation, setPlanToLocation] = useState();

    const [departuresFromInput, setDeparturesFromInput] = useState('');
    const [departuresLocation, setDeparturesLocation] = useState();

    const fetchInterval = useRef();

    const fetchNewDepartures = () => {
        fetch('https://api.entur.io/journey-planner/v3/graphql', {
            method: 'POST',
            headers: {
                'ET-Client-Name': 'joe_biden',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(curDeparturesQuery),
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    if (data.errors) {
                        console.warn('Departures error.');
                        return;
                    }
                    setDepartures(data);
                });
            }
        });
    }

    //TODO: use V3 instead of V2
    const fetchNewPlans = () => {
        fetch('https://api.entur.io/journey-planner/v2/graphql', {
            method: 'POST',
            headers: {
                'ET-Client-Name': 'joe_biden',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(curPlanQuery),
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    if (data.errors) {
                        console.warn('Trip error.');
                        return;
                    }
                    setPlans(data);
                });
            }
        });
    }

    /*
    useEffect(() => {
        fetchInterval.current = setInterval(() => {
            fetchNewDepartures();
        }, 60 * 1000);
        return () => {
            if (fetchInterval.current) {
                clearInterval(fetchInterval.current);
            }
        }
    }, []);
    */

    useEffect(() => {
        if (departuresLocation === undefined) {
            return;
        }
        setCurDeparturesQuery(generateDeparturesQuery(departuresLocation.properties.id));
    }, [departuresLocation]);

    useEffect(() => {
        if (planToLocation === undefined || planFromLocation === undefined) {
            return;
        }
        setCurPlanQuery(generatePlanQuery(planFromLocation.properties.id, planToLocation.properties.id));
    }, [planToLocation, planFromLocation]);

    useEffect(() => {
        if (curDeparturesQuery === undefined) {
            return;
        }
        fetchNewDepartures();
    }, [curDeparturesQuery]);

    useEffect(() => {
        if (curPlanQuery === undefined) {
            return;
        }
        fetchNewPlans();
    }, [curPlanQuery]);

    return (
        <div id='journey_planner'>
            <div id='journey_planner_planner'>
                <JourneyPlanner
                    planFromSearchInput={planFromSearchInput}
                    setPlanFromSearchInput={setPlanFromSearchInput}
                    planToSearchInput={planToSearchInput}
                    setPlanToSearchInput={setPlanToSearchInput}
                    planFromLocation={planFromLocation}
                    setPlanFromLocation={setPlanFromLocation}
                    planToLocation={planToLocation}
                    setPlanToLocation={setPlanToLocation}
                    departuresFromInput={departuresFromInput}
                    setDeparturesFromInput={setDeparturesFromInput}
                    departuresLocation={departuresLocation}
                    setDeparturesLocation={setDeparturesLocation}
                    selectedForm={selectedForm}
                    setSelectedForm={setSelectedForm} />
                <div id='journey_planner_results_container'>
                    <div id='journey_planner_results'>
                        {selectedForm === 'journey_planner' ? plans?.data.trip.tripPatterns.map((journey, index) => {
                            const startTime = new Date(journey.startTime);
                            const endTime = new Date(journey.endTime);
                            return (
                                <div key={index} className='journey_planner_result'>
                                    <div className='journey_planner_result_top_info'>
                                        <div className='journey_planner_result_top_info_expected_time departure_top_info_time'>
                                            {getHourMinDate(startTime)} - {getHourMinDate(endTime)}
                                        </div>
                                    </div>
                                    <div className='journey_planner_result_content_info'>
                                        {journey.legs.map((segment, index) => {
                                            const mode = segment.mode;
                                            return (
                                                <div key={index} className='journey_planner_result_content_info_segment'>
                                                    {mode === 'foot' ? (
                                                        <div>
                                                            🚶
                                                        </div>
                                                    ) : (
                                                        <TransportIdLabeled transportColor={segment.serviceJourney.line.presentation.colour} transportType={segment.serviceJourney.line.transportMode} transportNumber={segment.serviceJourney.line.publicCode} label={segment.fromEstimatedCall.destinationDisplay.frontText} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                            /*
                            const aimedStartTime = new Date(pattern.aimedStartTime);
                            const aimedEndTime = new Date(pattern.aimedEndTime);
                            const expectedStartTime = new Date(pattern.expectedStartTime);
                            const expectedEndTime = new Date(pattern.expectedEndTime);
                            const mode = pattern.mode;
                            return (
                                <div key={index} className='journey_planner_result'>
                                    <div className='journey_planner_result_top_info'>
                                        <div className='journey_planner_result_top_info_expected_time departure_top_info_time'>
                                            {getHourMinDate(expectedStartTime)} - {getHourMinDate(expectedEndTime)}
                                        </div>
                                        {expectedStartTime.valueOf() !== aimedStartTime.valueOf() && expectedEndTime.valueOf() !== aimedStartTime.valueOf() ? (
                                            <div className='journey_planner_result_top_info_aimed_time departure_top_info_time'>
                                                {getHourMinDate(aimedStartTime)} - {getHourMinDate(aimedEndTime)}
                                            </div>
                                        ) : undefined}
                                    </div>
                                    <div className='journey_planner_result_content_info'>
                                        {mode === 'foot' ? (
                                            <div>
                                                🚶
                                            </div>
                                        ) : (
                                            <TransportIdLabeled transportType={pattern.serviceJourney.line.transportMode} transportNumber={pattern.serviceJourney.line.publicCode} label={pattern.fromEstimatedCall.destinationDisplay.frontText} />
                                        )}
                                    </div>
                                </div>
                            );
                            */
                        }) : selectedForm === 'departures' ? departures?.data.stopPlace.estimatedCalls.map((departure, index) => {
                            const expectedDepartureTime = new Date(departure.expectedDepartureTime);
                            const aimedDepartureTime = new Date(departure.aimedDepartureTime);
                            return (
                                <div key={index} className='journey_planner_result'>
                                    <div className='journey_planner_result_top_info'>
                                        <div className='journey_planner_result_top_info_expected_time departure_top_info_time'>
                                            {getHourMinDate(expectedDepartureTime)}
                                        </div>
                                        {expectedDepartureTime.valueOf() !== aimedDepartureTime.valueOf() ? (
                                            <div className='journey_planner_result_top_info_aimed_time departure_top_info_time'>
                                                {getHourMinDate(aimedDepartureTime)}
                                            </div>
                                        ) : undefined}
                                    </div>
                                    <div className='journey_planner_result_content_info'>
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