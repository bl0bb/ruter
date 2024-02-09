import './index.css';

import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

import polyline from '@mapbox/polyline';

import React, { createContext, useContext, useEffect, useRef, useState, Fragment } from 'react';

import { Bus as BusIcon, Train as TrainIcon, PointPin as PointPinIcon, Tram as TramIcon, Subway as SubwayIcon, Boat as BoatIcon, Walk as WalkIcon, ArrowRight as ArrowRightIcon } from '../../../../svg';

const journeyPlannerContext = createContext();

const transportPointColors = {
    foot: 'rgb(80, 80, 80)',
    bus: 'rgb(118, 163, 0)',
    coach: 'rgb(118, 163, 0)',
    rail: 'rgb(0, 48, 135)',
    tram: 'rgb(0, 100, 255)',
    boat: 'rgb(0, 0, 255)',
};

const transportIcons = {
    bus: BusIcon,
    coach: BusIcon,
    bus_station: () => <div>🚏</div>,
    rail: TrainIcon,
    tram: TramIcon,
    subway: SubwayIcon,
    boat: BoatIcon,
    boat_stop: BoatIcon,
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
    'ferryStop': 'boat_stop',
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

function getReadableHourMinDate(ms) {
    const dayDiv = 3600 * 24;
    const hourDiv = 3600;
    let seconds = Math.floor(ms / 1000);
    let days = Math.floor(seconds / dayDiv);
    seconds %= dayDiv;
    let hours = Math.floor(seconds / hourDiv);
    seconds %= hourDiv;
    let minutes = Math.floor(seconds / 60);

    // Construct the formatted string
    let durationString = '';
    if (days > 0) {
        durationString += days + 'd ';
    }
    if (hours > 0) {
        durationString += hours + 'h ';
    }
    if (minutes > 0) {
        durationString += minutes + 'm';
    }

    if (durationString === '') {
        durationString = '< 0m';
    }

    return durationString;
}

function BaseTransportId({ transportColor, transportIcon, content }) {
    return (
        <div className='transport_id' style={{ '--transport-id-col': transportColor }}>
            <div className='transport_id_icon'>
                {React.createElement(transportIcon)}
            </div>
            {content}
        </div>
    );
}

function TransportId({ transportColor, transportType, transportNumber }) {
    return (
        <BaseTransportId transportColor={transportColor} transportIcon={transportIcons[transportType]} content={(
            <div className='transport_id_number'>
                {transportNumber}
            </div>
        )} />
    );
}

function WalkTransportId({ distance }) {
    return (
        <BaseTransportId transportColor={'rgb(80, 80, 80)'} transportIcon={WalkIcon} content={(
            <div className='walk_transport_id_distance'>
                {Math.floor((distance * 0.001) * 100) / 100} km
            </div>
        )} />
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
                    <input type='text' autoComplete='off' name={name} placeholder='Place, address, area' className='journey_planner_form_place_input_input_field' value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
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
                            <button key={index} type='button' className='journey_planner_form_place_input_suggestion' onClick={(e) => {
                                setIsFocused(false);
                                setSearchInput(suggestion.properties.name);
                                setLocation(suggestion);
                            }}>
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
                "place": `${from.properties.id}`,
                "coordinates": {
                    "longitude": from.geometry.coordinates[0],
                    "latitude": from.geometry.coordinates[1]
                }
            },
            "to": {
                "place": `${to.properties.id}`,
                "coordinates": {
                    "longitude": to.geometry.coordinates[0],
                    "latitude": to.geometry.coordinates[1]
                }
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
    //plans
    const [curPlanQuery, setCurPlanQuery] = useState();
    const [plans, setPlans] = useState();
    const [prevSelectedPlan, setPrevSelectedPlan] = useState();

    const [planFromSearchInput, setPlanFromSearchInput] = useState('');
    const [planToSearchInput, setPlanToSearchInput] = useState('');
    const [planFromLocation, setPlanFromLocation] = useState();
    const [planToLocation, setPlanToLocation] = useState();

    //departures
    const [curDeparturesQuery, setCurDeparturesQuery] = useState();
    const [departures, setDepartures] = useState();
    const [prevSelectedDeparture, setPrevSelectedDeparture] = useState();

    const [departuresFromInput, setDeparturesFromInput] = useState('');
    const [departuresLocation, setDeparturesLocation] = useState();



    const [selectedForm, setSelectedForm] = useState('journey_planner');



    const fetchInterval = useRef();

    const mapRef = useRef();

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

    const updateUrl = () => {
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams();
        searchParams.append('from', planFromLocation.properties.id);
        searchParams.append('to', planToLocation.properties.id);
        url.search = searchParams;
        window.history.replaceState(null, null, url.toString());
    }

    useEffect(() => {
        if (departuresLocation === undefined) {
            return;
        }
        setCurDeparturesQuery(generateDeparturesQuery(departuresLocation));
        updateUrl();
    }, [departuresLocation]);

    useEffect(() => {
        if (planToLocation === undefined || planFromLocation === undefined) {
            return;
        }
        setCurPlanQuery(generatePlanQuery(planFromLocation, planToLocation));
        updateUrl();
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

    useEffect(() => {
        if (mapRef.current === undefined) {
            return;
        }

        if (plans?.data === undefined) {
            return;
        }

        //TODO: add selected trip and replace 0 with the index of the trip
        const trip = plans.data.trip.tripPatterns[0];
        const points = [];
        trip.legs.forEach(leg => {
            const mode = leg.mode;
            const curPoints = leg.pointsOnLink.points;
            const coordinates = polyline.decode(curPoints).map(coord => [coord[0], coord[1]]);

            const polyConfig = {
                color: mode === 'foot' ? transportPointColors[mode] : `#${leg.serviceJourney.line.presentation.colour}`,
                weight: 4,
                opacity: 1,
            };

            if (mode === 'foot') {
                polyConfig.dashArray = '1, 6';
            }

            Leaflet.polyline(coordinates, polyConfig).addTo(mapRef.current);

            points.push(coordinates);
        });

        const startPoints = points[0];
        const endPoints = points[points.length - 1];

        const startPoint = startPoints[0];
        const endPoint = endPoints[endPoints.length - 1];

        const startIcon = Leaflet.icon({
            iconUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/location-travel-map/map-pin-icon.png',
            iconSize: [24, 32],
            iconAnchor: [12, 40],
            popupAnchor: [0, -32]
        });

        const endIcon = Leaflet.icon({
            iconUrl: 'https://cdn3.iconfinder.com/data/icons/auto-racing/441/Checkered_Flag-512.png',
            iconSize: [32, 32],
            iconAnchor: [16, 40],
            popupAnchor: [0, -32]
        });

        Leaflet.marker(startPoint, { icon: startIcon }).addTo(mapRef.current).bindPopup('Start');
        Leaflet.marker(endPoint, { icon: endIcon }).addTo(mapRef.current).bindPopup('End');

        mapRef.current.fitBounds([startPoint, endPoint]);
    }, [plans, departures, mapRef]);

    useEffect(() => {
        // Initialize Leaflet map
        mapRef.current = Leaflet.map('journey_planner_content_map').setView([0, 0], 13);
        Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);

        return () => {
            mapRef.current.remove();
        }
    }, []);

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
                                        <div className='journey_planner_result_top_info_expected_time journey_planner_result_top_info_time'>
                                            {getHourMinDate(startTime)} - {getHourMinDate(endTime)}
                                        </div>
                                        <div className='journey_planner_result_top_info_expected_duration'>
                                            {getReadableHourMinDate(new Date(endTime - startTime))}
                                        </div>
                                    </div>
                                    <div className='journey_planner_result_content_info'>
                                        {journey.legs.map((segment, index) => {
                                            const mode = segment.mode;
                                            return (
                                                <Fragment key={index}>
                                                    <div className='journey_planner_result_content_info_segment'>
                                                        {mode === 'foot' ? (
                                                            <WalkTransportId distance={segment.distance} />
                                                        ) : (
                                                            <TransportIdLabeled transportColor={`#${segment.serviceJourney.line.presentation.colour}`} transportType={segment.serviceJourney.line.transportMode} transportNumber={segment.serviceJourney.line.publicCode} label={segment.fromEstimatedCall.destinationDisplay.frontText} />
                                                        )}
                                                    </div>
                                                    {index < journey.legs.length - 1 ? (
                                                        <div className='journey_planner_result_content_info_arrow'>
                                                            <ArrowRightIcon />
                                                        </div>
                                                    ) : undefined}
                                                </Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
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
            <div id='journey_planner_content'>
                <div id='journey_planner_content_map_container'>
                    <div id='journey_planner_content_map'>

                    </div>
                </div>
            </div>
        </div>
    );
}