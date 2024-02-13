import './index.css';

import Leaflet from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import polyline from '@mapbox/polyline';

import React, { createContext, useContext, useEffect, useRef, useState, Fragment } from 'react';

import { Bus as BusIcon, Train as TrainIcon, PointPin as PointPinIcon, Tram as TramIcon, Subway as SubwayIcon, Boat as BoatIcon, Walk as WalkIcon, ArrowRight as ArrowRightIcon, Walk } from '../../../../svg';

const journeyPlannerContext = createContext();
const formDataContext = createContext();

const transportPointColors = {
    foot: 'var(--main-bg-light-col-2)',
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




function RailPlatformIcon({ platform }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 30" width="26" height="30" preserveAspectRatio="xMidYMid">
            <g transform="translate(3,0)">
                <rect x="-3" y="0" style="visibility: hidden" fill="#59C5FC" width="26" height="26" rx="13" ry="13"></rect>
                <rect x="-1" y="2" fill="white" width="22" height="22" rx="12" ry="12"></rect>
                <g transform="translate(10,13)">
                    <rect style="visibility: hidden" transform="rotate(45)" fill="#59C5FC" width="13" height="13"></rect>
                    <rect transform="rotate(45)" fill="white" width="11" height="11"></rect>
                    <rect transform="rotate(45)" fill="#252525" width="10" height="10"></rect>
                </g>
                <rect x="0" y="3" fill='#252525' width="20" height="20" rx="10" ry="10"></rect>
            </g>
            <text x="50%" y="50%" fill='#ffffff' style={{
                color: '#252525',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'DIN, sans-serif',
            }} text-anchor="middle" dy="0.18em">
                {platform}
            </text>
        </svg>
    );
}

function BusPlatformIcon({ platform }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 30" width="26" height="30" preserveAspectRatio="xMidYMid">
            <g transform="translate(3,0)">
                <rect x="-3" y="0" style="visibility: hidden" fill="#59C5FC" width="26" height="26" rx="13" ry="13"></rect>
                <rect x="-1" y="2" fill="#252525" width="22" height="22" rx="12" ry="12"></rect>
                <g transform="translate(10,13)">
                    <rect style="visibility: hidden" transform="rotate(45)" fill="#59C5FC" width="13" height="13"></rect>
                    <rect transform="rotate(45)" fill="#252525" width="11" height="11"></rect>
                    <rect transform="rotate(45)" fill="#252525" width="10" height="10"></rect>
                </g>
                <rect x="0" y="3" fill='#ffc800' width="20" height="20" rx="10" ry="10"></rect>
            </g>
            <text x="50%" y="50%" fill='#252525' style={{
                color: '#252525',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'DIN, sans-serif',
            }} text-anchor="middle" dy="0.18em">
                {platform}
            </text>
        </svg>
    );
}



function RailPlatformIconHTML({ platform }) {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 30" width="26" height="30" preserveAspectRatio="xMidYMid">
        <g transform="translate(3,0)">
            <rect x="-3" y="0" style="visibility: hidden" fill="#59C5FC" width="26" height="26" rx="13" ry="13"></rect>
            <rect x="-1" y="2" fill="white" width="22" height="22" rx="12" ry="12"></rect>
            <g transform="translate(10,13)">
                <rect style="visibility: hidden" transform="rotate(45)" fill="#59C5FC" width="13" height="13"></rect>
                <rect transform="rotate(45)" fill="white" width="11" height="11"></rect>
                <rect transform="rotate(45)" fill="#252525" width="10" height="10"></rect>
            </g>
            <rect x="0" y="3" fill='#252525' width="20" height="20" rx="10" ry="10"></rect>
        </g>
        <text x="50%" y="50%" fill='#ffffff' style="
            color: #252525;
            font-size: 14px;
            font-weight: 600;
            font-family: DIN, sans-serif;
        " text-anchor="middle" dy="0.18em">
            ${platform}
        </text>
    </svg>`;
}

function BusPlatformIconHTML({ platform }) {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 30" width="26" height="30" preserveAspectRatio="xMidYMid">
        <g transform="translate(3,0)">
            <rect x="-3" y="0" style="visibility: hidden" fill="#59C5FC" width="26" height="26" rx="13" ry="13"></rect>
            <rect x="-1" y="2" fill="#252525" width="22" height="22" rx="12" ry="12"></rect>
            <g transform="translate(10,13)">
                <rect style="visibility: hidden" transform="rotate(45)" fill="#59C5FC" width="13" height="13"></rect>
                <rect transform="rotate(45)" fill="#252525" width="11" height="11"></rect>
                <rect transform="rotate(45)" fill="#252525" width="10" height="10"></rect>
            </g>
            <rect x="0" y="3" fill='#ffc800' width="20" height="20" rx="10" ry="10"></rect>
        </g>
        <text x="50%" y="50%" fill='#252525' style="
            color: #252525;
            font-size: 14px;
            font-weight: 600;
            font-family: DIN, sans-serif;
        " text-anchor="middle" dy="0.18em">
            ${platform}
        </text>
    </svg>`;
}




function getWalkDistance(distance) {
    return `${Math.floor((distance * 0.001) * 100) / 100} km`;
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
        <BaseTransportId transportColor={transportPointColors.foot} transportIcon={WalkIcon} content={(
            <div className='walk_transport_id_distance'>
                {getWalkDistance(distance)}
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
                                    {layer === 'venue' ? removeDuplicates(categories).map((category, index) => {
                                        return React.createElement(transportIcons[transportationCategories[category]], { key: index });
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


function generateDeparturesQuery(stopPlace) {
    return {
        operationName: 'departures',
        query: `query departures($id: String!, $whiteListed: InputWhiteListed, $numberOfDepartures: Int = 500, $numberOfDeparturesPerLineAndDestinationDisplay: Int = 10, $numberOfSubsequentEstimatedCalls: Int = 5) {
            stopPlace(id: $id) {
              ...stopPlaceWithQuaysWithDeparturesFragment
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
          
          fragment estimatedCallWithServiceJourneyFragment on EstimatedCall {
            ...estimatedCallFragment
            serviceJourney {
              ...serviceJourneyFragment
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
          
          fragment quayWithDeparturesFragment on Quay {
            ...quayFragment
            estimatedCalls(timeRange: 14400, whiteListed: $whiteListed, numberOfDepartures: $numberOfDepartures, numberOfDeparturesPerLineAndDestinationDisplay: $numberOfDeparturesPerLineAndDestinationDisplay, omitNonBoarding: true) {
              ...estimatedCallWithServiceJourneyFragment
              __typename
            }
            subsequentEstimatedCalls: estimatedCalls(timeRange: 14400, whiteListed: $whiteListed, numberOfDepartures: 500, numberOfDeparturesPerLineAndDestinationDisplay: $numberOfSubsequentEstimatedCalls, omitNonBoarding: true) {
                aimedDepartureTime
              expectedDepartureTime
              realtime
              destinationDisplay {
                frontText
                __typename
              }
              serviceJourney {
                id
                line {
                  id
                  publicCode
                  __typename
                }
                __typename
              }
              __typename
            }
            situations {
              ...situationFragment
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
          
          fragment stopPlaceFragment on StopPlace {
            id
            name
            description
            latitude
            longitude
            transportMode
            tariffZones {
              ...tariffZoneFragment
              __typename
            }
            parent {
              id
              __typename
            }
            __typename
          }
          
          fragment stopPlaceWithQuaysWithDeparturesFragment on StopPlace {
            ...stopPlaceFragment
            quays {
              ...quayWithDeparturesFragment
              __typename
            }
            __typename
          }`,
        variables: {
            "numberOfDepartures": 500,
            "numberOfDeparturesPerLineAndDestinationDisplay": 1,
            "numberOfSubsequentEstimatedCalls": 6,
            "id": stopPlace.properties.id,
        },
    };
}

function generatePlansQuery(from, to) {
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

function usePlannerFormData(planData, setPlanData, selectedResult, setSelectedResults, fetchResults, generateQuery) {
    const { updateUrl, isURLLoaded } = useContext(journeyPlannerContext);

    const [curPlanQuery, setCurPlanQuery] = useState();
    const [plans, setPlans] = useState();

    const fetchNewPlans = () => {
        fetchResults(setPlans, JSON.stringify(curPlanQuery));
    }

    useEffect(() => {
        if (isURLLoaded === false) {
            return;
        }
        updateUrl(planData);
        if (Object.values(planData).findIndex((plan) => plan.location === undefined) !== -1) {
            return;
        }
        setCurPlanQuery(generateQuery(planData));
    }, [...Object.values(planData).map((plan) => plan.location), isURLLoaded]);

    useEffect(() => {
        if (curPlanQuery === undefined) {
            return;
        }
        fetchNewPlans();
    }, [curPlanQuery]);

    return {
        planData,
        setPlanData,
        curPlanQuery,
        setCurPlanQuery,
        plans,
        setPlans,
    };
}







//journey
function PlansContainer({ children }) {
    const { selectedForm, setResults, setIsURLLoaded, inputs, setInputs, selectedResults, setSelectedResults } = useContext(journeyPlannerContext);

    //TODO: use V3 instead of V2
    const fetchNewPlans = (setPlans, body) => {
        fetch('https://api.entur.io/journey-planner/v2/graphql', {
            method: 'POST',
            headers: {
                'ET-Client-Name': 'joe_biden',
                'Content-Type': 'application/json',
            },
            body: body,
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    if (data.errors) {
                        console.warn('Trip error.');
                        return;
                    }
                    setPlans(data);
                    setResults((prev) => {
                        return {
                            ...prev,
                            [selectedForm]: data,
                        };
                    });
                });
            }
        });
    }

    const generatePlansQueryFromData = (planData) => {
        return generatePlansQuery(planData.from.location, planData.to.location);
    }

    const plansFormData = usePlannerFormData(inputs[selectedForm], (value) => {
        setInputs((prev) => {
            return {
                ...prev,
                [selectedForm]: typeof (value) === 'function' ? value(prev[selectedForm]) : value,
            };
        });
    }, selectedResults[selectedForm], (value) => {
        setSelectedResults((prev) => {
            return {
                ...prev,
                [selectedForm]: value,
            };
        });
    }, fetchNewPlans, generatePlansQueryFromData);

    useEffect(() => {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        const from = searchParams.get('from');
        const to = searchParams.get('to');

        const loadPlace = (str, cb) => {
            fetch(`https://api.entur.io/geocoder/v1/autocomplete?text=${str}&lang=en`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        const place = data.features[0];

                        cb(place);
                    });
                }
            });
        }

        if (from === null && to === null) {
            setIsURLLoaded(true);
            return;
        }

        const loadingProps = {};

        const checkDoneLoading = () => {
            if (Object.values(loadingProps).includes(false) === true) {
                return;
            }
            setIsURLLoaded(true);
        }

        if (from) {
            loadingProps.from = false;
            loadPlace(from, (place) => {
                plansFormData.setPlanData((prev) => {
                    return {
                        ...prev,
                        from: {
                            ...prev.from,
                            location: place,
                            input: place.properties.name,
                        },
                    };
                });
                loadingProps.from = true;
                checkDoneLoading();
            });
        }

        if (to) {
            loadingProps.to = false;
            loadPlace(to, (place) => {
                plansFormData.setPlanData((prev) => {
                    return {
                        ...prev,
                        to: {
                            ...prev.to,
                            location: place,
                            input: place.properties.name,
                        },
                    };
                });
                loadingProps.to = true;
                checkDoneLoading();
            });
        }
    }, []);

    return (
        <formDataContext.Provider value={{ formData: plansFormData }}>
            {children}
        </formDataContext.Provider>
    );
}

function JourneyPlannerForm() {
    const { formData } = useContext(formDataContext);

    return (
        <form id='journey_planner_planner_form'>
            <h2 id='journey_planner_form_title'>
                Where do you want to go?
            </h2>
            <div id='journey_planner_planner_form_place_inputs'>
                <JourneyPlannerPlaceInput name='from' label='From' icons={[BusIcon, TrainIcon]} searchInput={formData.planData.from.input} setSearchInput={(value) => formData.setPlanData((prev) => {
                    return {
                        ...prev,
                        from: {
                            ...prev.from,
                            input: value
                        }
                    };
                })} setLocation={(value) => formData.setPlanData((prev) => {
                    return {
                        ...prev,
                        from: {
                            ...prev.from,
                            location: value
                        }
                    };
                })} />
                <JourneyPlannerPlaceInput name='to' label='To' icons={[BusIcon, TrainIcon]} searchInput={formData.planData.to.input} setSearchInput={(value) => formData.setPlanData((prev) => {
                    return {
                        ...prev,
                        to: {
                            ...prev.to,
                            input: value
                        }
                    };
                })} setLocation={(value) => formData.setPlanData((prev) => {
                    return {
                        ...prev,
                        to: {
                            ...prev.to,
                            location: value
                        }
                    };
                })} />
            </div>
        </form>
    );
}

function JourneyResults({ results }) {
    const { selectedForm, setSelectedResults } = useContext(journeyPlannerContext);

    return results?.data.trip.tripPatterns.map((journey, index) => {
        const startTime = new Date(journey.startTime);
        const endTime = new Date(journey.endTime);
        return (
            <button key={index} className='journey_planner_result' onClick={() => {
                setSelectedResults((prev) => {
                    return {
                        ...prev,
                        [selectedForm]: index,
                    };
                });
            }}>
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
            </button>
        );
    });
}

function JourneySelectedResultSegmentRow({ left, middle, right }) {
    return (
        <div className='journey_planner_selected_result_segment_row'>
            <div className='journey_planner_selected_result_segment_row_side journey_planner_selected_result_segment_row_left'>
                {left}
            </div>
            <div className='journey_planner_selected_result_segment_row_side journey_planner_selected_result_segment_row_middle'>
                {middle}
            </div>
            <div className='journey_planner_selected_result_segment_row_side journey_planner_selected_result_segment_row_right'>
                {right}
            </div>
        </div>
    );
}

const journeySelectedResultLineThickness = 8;
const halfJourneySelectedResultLineThickness = journeySelectedResultLineThickness * 0.5;

function JourneySelectedResultLine({ side, top, bottom, color }) {
    return (
        <div className='journey_planner_selected_result_line_container'>
            <div className={`journey_planner_selected_result_line journey_planner_selected_result_line_${side}`} style={{
                '--journey-planner-selected-result-line-top': top,
                '--journey-planner-selected-result-line-bottom': bottom,
                '--journey-planner-selected-result-line-color': color,
                '--journey-planner-selected-result-line-thickness': `${journeySelectedResultLineThickness}px`,
                '--journey-planner-selected-result-line-half-thickness': `${halfJourneySelectedResultLineThickness}px`,
            }}>

            </div>
        </div>
    );
}

function JourneySelectedResultLineTop({ color }) {
    return (
        <JourneySelectedResultLine side='top' top='0%' bottom='0%' color={color} />
    );
}

function JourneySelectedResultLineMiddle({ color }) {
    return (
        <JourneySelectedResultLine side='middle' top='0%' bottom='0%' color={color} />
    );
}

function JourneySelectedResultLineBottom({ color }) {
    return (
        <JourneySelectedResultLine side='bottom' top='0%' bottom='0%' color={color} />
    );
}

function JourneySelectedResultTime({ expectedStart, aimedStart }) {
    return (
        <div className='journey_planner_planner_selected_result_time'>
            <div className='journey_planner_planner_selected_result_time_expected'>
                {getHourMinDate(expectedStart)}
            </div>
            {expectedStart.valueOf() !== aimedStart.valueOf() ? (
                <div className='journey_planner_planner_selected_result_time_aimed'>
                    {getHourMinDate(aimedStart)}
                </div>
            ) : undefined}
        </div>
    )
}

function JourneySelectedResult({ result, selectedResult }) {
    const selectedJourney = result?.data.trip.tripPatterns[selectedResult];
    return (
        <div id='journey_planner_planner_selected_result'>
            <div id='journey_planner_selected_result_segments'>
                {selectedJourney?.legs.map((leg, index) => {
                    const mode = leg.mode;

                    let content;

                    console.log(leg)

                    if (mode === 'foot') {
                        const expectedStartTime = new Date(leg.expectedStartTime);
                        const aimedStartTime = new Date(leg.aimedStartTime);

                        const expectedEndTime = new Date(leg.expectedEndTime);
                        const aimedEndTime = new Date(leg.aimedEndTime);

                        content = (
                            <>
                                <JourneySelectedResultSegmentRow
                                    left={
                                        <JourneySelectedResultTime expectedStart={expectedStartTime} aimedStart={aimedStartTime} />
                                    }
                                    middle={
                                        <JourneySelectedResultLineTop color={transportPointColors.foot} />
                                    }
                                />
                                <JourneySelectedResultSegmentRow
                                    middle={
                                        <JourneySelectedResultLineMiddle color={transportPointColors.foot} />
                                    }
                                    right={<>
                                        <div>
                                            <WalkIcon />
                                        </div>
                                        <div>
                                            {getWalkDistance(leg.distance)}
                                        </div>
                                    </>}
                                />
                                <JourneySelectedResultSegmentRow
                                    left={
                                        <JourneySelectedResultTime expectedStart={expectedEndTime} aimedStart={aimedEndTime} />
                                    }
                                    middle={
                                        <JourneySelectedResultLineBottom color={transportPointColors.foot} />
                                    }
                                />
                            </>
                        );
                    } else {
                        const fromEstimatedCall = leg.fromEstimatedCall;

                        const expectedDepartureTime = new Date(fromEstimatedCall.expectedDepartureTime);
                        const aimedDepartureTime = new Date(fromEstimatedCall.aimedDepartureTime);

                        const toEstimatedCall = leg.toEstimatedCall;

                        const expectedArrivalTime = new Date(toEstimatedCall.expectedArrivalTime);
                        const aimedArrivalTime = new Date(toEstimatedCall.aimedArrivalTime);

                        content = (
                            <>
                                <JourneySelectedResultSegmentRow
                                    left={
                                        <JourneySelectedResultTime expectedStart={expectedDepartureTime} aimedStart={aimedDepartureTime} />
                                    }
                                    middle={
                                        <JourneySelectedResultLineTop color={`#${leg.serviceJourney.line.presentation.colour}`} />
                                    }
                                    right={
                                        <div>
                                            {fromEstimatedCall.quay.name}
                                        </div>
                                    }
                                />
                                <JourneySelectedResultSegmentRow
                                    middle={
                                        <JourneySelectedResultLineMiddle color={`#${leg.serviceJourney.line.presentation.colour}`} />
                                    }
                                    right={
                                        <div className='journey_planner_selected_result_segment_row_right_info'>
                                            <TransportIdLabeled
                                                transportColor={`#${leg.serviceJourney.line.presentation.colour}`}
                                                transportType={leg.serviceJourney.line.transportMode}
                                                transportNumber={leg.serviceJourney.line.publicCode}
                                                label={leg.fromEstimatedCall.destinationDisplay.frontText}
                                            />
                                        </div>
                                    }
                                />
                                <JourneySelectedResultSegmentRow
                                    left={
                                        <JourneySelectedResultTime expectedStart={expectedArrivalTime} aimedStart={aimedArrivalTime} />
                                    }
                                    middle={
                                        <JourneySelectedResultLineBottom color={`#${leg.serviceJourney.line.presentation.colour}`} />
                                    }
                                    right={
                                        <div>
                                            {toEstimatedCall.quay.name}
                                        </div>
                                    }
                                />
                            </>
                        );
                    }

                    return (
                        <div key={index} className='journey_planner_selected_result_segment'>
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function JourneyPlannerMap() {
    const { formData } = useContext(formDataContext);
    const { results, selectedForm, selectedResults } = useContext(journeyPlannerContext)

    const [mapData, setMapData] = useState({
        polylines: [],
        markers: [],
    });

    const map = useMap();

    const curResults = results[selectedForm];

    useEffect(() => {
        const newMapData = {
            polylines: [],
            markers: [],
        };

        const points = [];

        let startPoint;
        let endPoint;

        if (curResults?.data !== undefined) {
            const trip = curResults.data.trip.tripPatterns[selectedResults[selectedForm]];
            trip.legs.forEach(leg => {
                const mode = leg.mode;
                const curPoints = leg.pointsOnLink.points;
                const coordinates = polyline.decode(curPoints).map(coord => [coord[0], coord[1]]);

                const borderPolyConfig = {
                    color: '#ffffff',
                    opacity: 1,
                    weight: 8,
                };

                const fillPolyConfig = {
                    color: mode === 'foot' ? transportPointColors[mode] : `#${leg.serviceJourney.line.presentation.colour}`,
                    opacity: 1,
                    weight: 4,
                };

                if (mode === 'foot') {
                    borderPolyConfig.dashArray = '0.5, 8';
                    fillPolyConfig.dashArray = '0.5, 8';
                } else {
                    borderPolyConfig.dashArray = '0, 0';
                    fillPolyConfig.dashArray = '0, 0';
                }

                newMapData.polylines.push({
                    coordinates: coordinates,
                    config: borderPolyConfig,
                });
                newMapData.polylines.push({
                    coordinates: coordinates,
                    config: fillPolyConfig,
                });

                points.push(coordinates);
            });

            const startPoints = points[0];
            const endPoints = points[points.length - 1];

            startPoint = startPoints[0];
            endPoint = endPoints[endPoints.length - 1];

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

            newMapData.markers.push({
                pos: startPoint,
                icon: startIcon,
            });
            newMapData.markers.push({
                pos: endPoint,
                icon: endIcon,
            });

            map.fitBounds(points);
        }

        setMapData(newMapData);
    }, [selectedResults[selectedForm], curResults]);

    return (
        <>
            {mapData.markers.map((marker, index) => {
                return (
                    <Marker key={index} position={marker.pos} icon={marker.icon}>
                        <Popup>
                            bob
                        </Popup>
                    </Marker>
                );
            })}
            {mapData.polylines.map((polyline, index) => {
                return (
                    <Polyline key={index} positions={polyline.coordinates} pathOptions={polyline.config} />
                );
            })}
        </>
    );
}







//departures
function DeparturesContainer({ children }) {
    const { selectedForm, setResults, setIsURLLoaded, inputs, setInputs, selectedResults, setSelectedResults } = useContext(journeyPlannerContext);

    const fetchNewDepartures = (setPlans, body) => {
        fetch('https://api.entur.io/journey-planner/v3/graphql', {
            method: 'POST',
            headers: {
                'ET-Client-Name': 'joe_biden',
                'Content-Type': 'application/json',
            },
            body: body,
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    if (data.errors) {
                        console.warn('Departures error.');
                        return;
                    }
                    setPlans(data);
                    setResults((prev) => {
                        return {
                            ...prev,
                            [selectedForm]: data,
                        };
                    });
                });
            }
        });
    }

    const generateDeparturesQueryFromData = (planData) => {
        return generateDeparturesQuery(planData.from.location);
    }

    const departuresFormData = usePlannerFormData(inputs[selectedForm], (value) => {
        setInputs((prev) => {
            return {
                ...prev,
                [selectedForm]: typeof (value) === 'function' ? value(prev[selectedForm]) : value,
            };
        });
    }, selectedResults[selectedForm], (value) => {
        setSelectedResults((prev) => {
            return {
                ...prev,
                [selectedForm]: value,
            };
        });
    }, fetchNewDepartures, generateDeparturesQueryFromData);

    useEffect(() => {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        const from = searchParams.get('from');

        const loadPlace = (str, cb) => {
            fetch(`https://api.entur.io/geocoder/v1/autocomplete?text=${str}&lang=en`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        const place = data.features[0];

                        cb(place);
                    });
                }
            });
        }

        if (from === null) {
            setIsURLLoaded(true);
            return;
        }

        const loadingProps = {};

        const checkDoneLoading = () => {
            if (Object.values(loadingProps).includes(false) === true) {
                return;
            }
            setIsURLLoaded(true);
        }

        if (from) {
            loadingProps.from = false;
            loadPlace(from, (place) => {
                departuresFormData.setPlanData((prev) => {
                    return {
                        ...prev,
                        from: {
                            ...prev.from,
                            location: place,
                            input: place.properties.name,
                        },
                    };
                });
                loadingProps.from = true;
                checkDoneLoading();
            });
        }
    }, []);

    return (
        <formDataContext.Provider value={{ formData: departuresFormData }}>
            {children}
        </formDataContext.Provider>
    );
}

function DeparturesForm() {
    const { formData } = useContext(formDataContext);

    return (
        <form id='journey_planner_planner_form'>
            <h2 id='journey_planner_form_title'>
                Where do you want to travel from?
            </h2>
            <JourneyPlannerPlaceInput name='from' label='From' icons={[BusIcon, TrainIcon]} searchInput={formData.planData.from.input} setSearchInput={(value) => formData.setPlanData((prev) => {
                return {
                    ...prev,
                    from: {
                        ...prev.from,
                        input: value
                    }
                };
            })} setLocation={(value) => formData.setPlanData((prev) => {
                return {
                    ...prev,
                    from: {
                        ...prev.from,
                        location: value
                    }
                };
            })} />
        </form>
    );
}

function DeparturesResults({ results }) {
    const { selectedForm, setSelectedResults } = useContext(journeyPlannerContext);

    return results?.data.stopPlace?.quays.filter((quay) => quay.publicCode !== null && quay.publicCode !== '').map((quay, index) => {
        const calls = [];
        for (let i = 0; i < quay.estimatedCalls.length; i++) {
            const curCall = quay.estimatedCalls[i];
            calls.push({
                service: curCall,
                calls: [curCall],
            });
        }
        for (let i = 1; i < quay.subsequentEstimatedCalls.length; i++) {
            const curCall = quay.subsequentEstimatedCalls[i];
            const found = calls.find((checkCall) => curCall.serviceJourney.line.id === checkCall.service.serviceJourney.line.id);
            found.calls.push(curCall);
        }

        return (
            <button key={index} className='journey_planner_result' onClick={(e) => {
                setSelectedResults((prev) => {
                    return {
                        ...prev,
                        [selectedForm]: index,
                    };
                });
            }}>
                <div className='journey_planner_departure_platform'>
                    Plattform{quay.publicCode ? ` ${quay.publicCode}` : ''}{quay.description ? ` ${quay.description}` : ''}
                </div>
                <div className='journey_planner_departure_lines'>
                    {calls.map((call, index) => {
                        const service = call.service;
                        return (
                            <div key={index} className='journey_planner_departure_line' onClick={() => {

                            }}>
                                <div className='journey_planner_result_content_info'>
                                    <TransportIdLabeled transportColor={`#${service.serviceJourney.line.presentation.colour}`} transportType={service.serviceJourney.line.transportMode} transportNumber={service.serviceJourney.line.publicCode} label={service.destinationDisplay.frontText} />
                                </div>
                                <div className='journey_planner_departure_line_calls'>
                                    {call.calls.map((departure, index) => {
                                        const expectedDepartureTime = new Date(departure.expectedDepartureTime);
                                        const aimedDepartureTime = new Date(departure.aimedDepartureTime);
                                        return (
                                            <div key={index} className='journey_planner_departure_line_call' onClick={() => {

                                            }}>
                                                <div className='journey_planner_result_top_info_expected_time departure_top_info_time'>
                                                    {getHourMinDate(expectedDepartureTime)}
                                                </div>
                                                {expectedDepartureTime.valueOf() !== aimedDepartureTime.valueOf() ? (
                                                    <div className='journey_planner_result_top_info_aimed_time departure_top_info_time'>
                                                        {getHourMinDate(aimedDepartureTime)}
                                                    </div>
                                                ) : undefined}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </button>
        );
    });
}

function DeparturesSelectedResult({ result, selectedResult }) {
    console.log("dep", result, selectedResult);
    return (
        <>
            bbop
        </>
    )
}

function DeparturesMap() {
    const { formData } = useContext(formDataContext);
    const { results, selectedForm, selectedResults } = useContext(journeyPlannerContext)

    const [mapData, setMapData] = useState({
        markers: [],
    });

    const map = useMap();

    const curResults = results[selectedForm];

    useEffect(() => {
        const newMapData = {
            markers: [],
        };

        const stopPlace = curResults?.data.stopPlace;

        if (stopPlace) {
            const targetPoint = [stopPlace.latitude, stopPlace.longitude];

            const targetIcon = Leaflet.icon({
                iconUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/location-travel-map/map-pin-icon.png',
                iconSize: [24, 32],
                iconAnchor: [12, 40],
                popupAnchor: [0, -32]
            });

            newMapData.markers.push({
                pos: targetPoint,
                icon: targetIcon,
            });

            stopPlace.quays.forEach((quay) => {
                if (quay.publicCode === null || quay.publicCode === '') return;

                const quayMode = quay.stopPlace.transportMode[0];

                newMapData.markers.push({
                    pos: [quay.latitude, quay.longitude],
                    icon: Leaflet.divIcon({
                        className: 'journey_planner_map_quay_icon',
                        html: (quayMode === 'bus' ? BusPlatformIconHTML : RailPlatformIconHTML)({ platform: quay.publicCode }),
                        iconSize: [26, 30],
                        iconAnchor: [13, 38],
                        popupAnchor: [0, -30],
                    }),
                });
            });

            map.fitBounds(newMapData.markers.map((marker) => marker.pos));
        }

        setMapData(newMapData);
    }, [selectedResults[selectedForm], curResults]);

    return (
        <>
            {mapData.markers.map((marker, index) => {
                return (
                    <Marker key={index} position={marker.pos} icon={marker.icon} />
                );
            })}
        </>
    );
}










//bbop
function JourneyPlannerResults() {
    const { selectedForm, forms, results } = useContext(journeyPlannerContext);
    return (
        <>
            {React.createElement(forms[selectedForm].results, {
                results: results[selectedForm],
            })}
        </>
    );
}

function JourneyPlannerSelectedResult() {
    const { selectedForm, forms, results, selectedResults } = useContext(journeyPlannerContext);
    return (
        <>
            {React.createElement(forms[selectedForm].selectedResult, {
                result: results[selectedForm],
                selectedResult: selectedResults[selectedForm],
            })}
        </>
    );
}

function JourneyPlanner() {
    const { selectedForm, setSelectedForm, forms, curForm } = useContext(journeyPlannerContext);

    return (
        <div id='journey_planner_planner_form_display'>
            <div id='journey_planner_planner_form_display_select'>
                {Object.values(forms).map((form, index) => {
                    return (
                        <button key={index} className={`journey_planner_form_display_select_button${selectedForm === form.id ? ' journey_planner_form_display_select_button_selected' : ''}`} onClick={() => setSelectedForm(form.id)}>
                            {form.name}
                        </button>
                    );
                })}
            </div>
            <div id='journey_planner_planner_form_container'>
                {React.createElement(curForm.form)}
            </div>
        </div>
    );
}

export default function Index() {
    //TODO: append initial values as stuff retrieved from url too lazy to do it rn
    const [selectedForm, setSelectedForm] = useState('journey_planner');
    const [isURLLoaded, setIsURLLoaded] = useState(false);

    const [inputs, setInputs] = useState({
        journey_planner: {
            from: {
                input: '',
            },
            to: {
                input: '',
            },
        },
        departures: {
            from: {
                input: '',
            },
        },
    });

    const [selectedResults, setSelectedResults] = useState({
        journey_planner: 0,
        departures: 0,
    });

    const [results, setResults] = useState({});

    const forms = {
        journey_planner: {
            id: 'journey_planner',
            urlIndex: true,
            urlType: 'j',
            name: 'Journey Planner',
            container: PlansContainer,
            form: JourneyPlannerForm,
            results: JourneyResults,
            selectedResult: JourneySelectedResult,
            map: JourneyPlannerMap,
        },
        departures: {
            id: 'departures',
            urlType: 'd',
            name: 'Departures',
            container: DeparturesContainer,
            form: DeparturesForm,
            results: DeparturesResults,
            selectedResult: DeparturesSelectedResult,
            map: DeparturesMap,
        },
    };



    const fetchInterval = useRef();

    const [mapCenter, setMapCenter] = useState([59.9139, 10.7522]);


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

    const updateUrl = (data) => {
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams();
        const curForm = forms[selectedForm];
        if (curForm.urlIndex !== true) {
            searchParams.append('type', curForm.urlType);
        }
        for (const [key, value] of Object.entries(data)) {
            if (value.location === undefined) {
                continue;
            }
            searchParams.append(key, value.location.properties.label);
        }
        url.search = searchParams;
        window.history.replaceState(null, null, url.toString());
    }



    useEffect(() => {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        const type = searchParams.get('type');

        if (type === null) {
            setSelectedForm(Object.values(forms).find((form) => form.urlIndex === true).id);
        } else {
            setSelectedForm(Object.values(forms).find((form) => form.urlType === type).id);
        }
    }, []);










    const curForm = forms[selectedForm];

    return (
        <div id='journey_planner'>
            <journeyPlannerContext.Provider value={{
                selectedForm: selectedForm,
                setSelectedForm: setSelectedForm,
                forms: forms,
                curForm: curForm,
                results: results,
                setResults: setResults,
                isURLLoaded: isURLLoaded,
                setIsURLLoaded: setIsURLLoaded,
                updateUrl: updateUrl,
                inputs: inputs,
                setInputs: setInputs,
                selectedResults: selectedResults,
                setSelectedResults: setSelectedResults,
            }}>
                {React.createElement(curForm.container, {}, (
                    <>
                        <div id='journey_planner_planner'>
                            <JourneyPlanner selectedForm={selectedForm} setSelectedForm={setSelectedForm} forms={forms} />
                            <div id='journey_planner_results_container'>
                                <div id='journey_planner_results'>
                                    <JourneyPlannerResults selectedForm={selectedForm} forms={forms} />
                                </div>
                            </div>
                        </div>
                        <div id='journey_planner_selected_result'>
                            <JourneyPlannerSelectedResult />
                        </div>
                        <div id='journey_planner_content'>
                            <div id='journey_planner_content_map_container'>
                                <MapContainer id='journey_planner_content_map' center={mapCenter} zoom={11} scrollWheelZoom={true}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {React.createElement(curForm.map)}
                                </MapContainer>
                            </div>
                        </div>
                    </>
                ))}
            </journeyPlannerContext.Provider>
        </div>
    );
}