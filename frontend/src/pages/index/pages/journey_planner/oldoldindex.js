import './index.css';

import Leaflet from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
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

function JourneyPlannerForm() {
    const { curFormData } = useContext(journeyPlannerContext);

    return (
        <form id='journey_planner_planner_form'>
            <h2 id='journey_planner_form_title'>
                Where do you want to go?
            </h2>
            <div id='journey_planner_planner_form_place_inputs'>
                <JourneyPlannerPlaceInput name='from' label='From' icons={[BusIcon, TrainIcon]} searchInput={curFormData.planData.from.input} setSearchInput={(value) => curFormData.setPlanData((prev) => {
                    return {
                        ...prev,
                        from: {
                            ...prev.from,
                            input: value
                        }
                    };
                })} setLocation={(value) => curFormData.setPlanData((prev) => {
                    return {
                        ...prev,
                        from: {
                            ...prev.from,
                            location: value
                        }
                    };
                })} />
                <JourneyPlannerPlaceInput name='to' label='To' icons={[BusIcon, TrainIcon]} searchInput={curFormData.planData.to.input} setSearchInput={(value) => curFormData.setPlanData((prev) => {
                    return {
                        ...prev,
                        to: {
                            ...prev.to,
                            input: value
                        }
                    };
                })} setLocation={(value) => curFormData.setPlanData((prev) => {
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

function DeparturesForm() {
    const { curFormData } = useContext(journeyPlannerContext);

    return (
        <form id='journey_planner_planner_form'>
            <h2 id='journey_planner_form_title'>
                Where do you want to travel from?
            </h2>
            <JourneyPlannerPlaceInput name='from' label='From' icons={[BusIcon, TrainIcon]} searchInput={curFormData.planData.from.input} setSearchInput={(value) => curFormData.setPlanData((prev) => {
                return {
                    ...prev,
                    from: {
                        ...prev.from,
                        input: value
                    }
                };
            })} setLocation={(value) => curFormData.setPlanData((prev) => {
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
    return results?.data.stopPlace.quays.map((quay, index) => {
        return (
            <div key={index}>
                <div>
                    Platform{quay.publicCode ? ` ${quay.publicCode}` : ''}{quay.description ? ` ${quay.description}` : ''}
                </div>
                <div>
                    {quay.estimatedCalls.map((departure, index) => {
                        const expectedDepartureTime = new Date(departure.expectedDepartureTime);
                        const aimedDepartureTime = new Date(departure.aimedDepartureTime);
                        return (
                            <div key={index} className='journey_planner_result' onClick={() => {

                            }}>
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
                    })}
                </div>
            </div>
        );
    });
}

function DeparturesMap() {
    /*
    if (mapRef.current === undefined) {
        return;
    }

    if (departuresFormData.plans?.data === undefined) {
        return;
    }

    const oldMapData = departuresFormData.mapData;
    if (oldMapData) {
        for (let i = 0; i < oldMapData.markers.length; i++) {
            oldMapData.markers[i].remove();
        }
    }

    const newMapData = {
        markers: [],
    };

    const stopPlace = departuresFormData.plans.data.stopPlace;

    const targetPoint = [stopPlace.latitude, stopPlace.longitude];

    const targetIcon = Leaflet.icon({
        iconUrl: 'https://uxwing.com/wp-content/themes/uxwing/download/location-travel-map/map-pin-icon.png',
        iconSize: [24, 32],
        iconAnchor: [12, 40],
        popupAnchor: [0, -32]
    });

    newMapData.markers.push(Leaflet.marker(targetPoint, { icon: targetIcon }).addTo(mapRef.current).bindPopup('Target'));

    mapRef.current.setView(targetPoint);

    departuresFormData.setMapData(newMapData);
    */
}

function JourneyResults({ results }) {
    const { curFormData } = useContext(journeyPlannerContext);

    return results?.data.trip.tripPatterns.map((journey, index) => {
        const startTime = new Date(journey.startTime);
        const endTime = new Date(journey.endTime);
        return (
            <button key={index} className='journey_planner_result' onClick={() => {
                curFormData.setSelectedPlan(index);
                /*
                mapRef.current.flyTo({
                    center: [journey.from.location.longitude, journey.from.location.latitude],
                    zoom: 15
                });
                */
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

function JourneyPlannerResults({ selectedForm, forms, formsData }) {
    const results = formsData[selectedForm].plans;
    return (
        <>
            {React.createElement(forms[selectedForm].results, { results })}
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
                        <div key={index} className={`journey_planner_form_display_select_button${selectedForm === form.id ? ' journey_planner_form_display_select_button_selected' : ''}`} onClick={() => setSelectedForm(form.id)}>
                            {form.name}
                        </div>
                    );
                })}
            </div>
            <div id='journey_planner_planner_form_container'>
                {React.createElement(curForm.form)}
            </div>
        </div>
    );
}

function JourneyPlannerMap() {
    const { curFormData, setMapCenter } = useContext(journeyPlannerContext);

    const map = useMap();

    const newMapData = {
        polylines: [],
        markers: [],
    };

    const points = [];

    let startPoint;
    let endPoint;

    if (curFormData.plans?.data !== undefined) {
        const trip = curFormData.plans.data.trip.tripPatterns[curFormData.selectedPlan];
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

    useEffect(() => {
        if (startPoint === undefined || endPoint === undefined) {
            return;
        }

        setMapCenter([startPoint, endPoint]);
    }, [curFormData.selectedPlan]);

    return (
        <>
            {newMapData.markers.map((marker, index) => {
                return (
                    <Marker key={index} position={marker.pos} icon={marker.icon}>
                        <Popup>
                            bob
                        </Popup>
                    </Marker>
                );
            })}
            {newMapData.polylines.map((polyline, index) => {
                return (
                    <Polyline key={index} positions={polyline.coordinates} pathOptions={polyline.config} />
                );
            })}
        </>
    );
}

function usePlannerFormData(inputs, updateUrl, fetchResults, generateQuery, isURLLoaded) {
    const [curPlanQuery, setCurPlanQuery] = useState();
    const [plans, setPlans] = useState();
    const [selectedPlan, setSelectedPlan] = useState(0);
    const [mapData, setMapData] = useState();

    const [planData, setPlanData] = useState(inputs);

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
        selectedPlan,
        setSelectedPlan,
        mapData,
        setMapData,
    };
}

export default function Index() {
    const [selectedForm, setSelectedForm] = useState('journey_planner');
    const [isURLLoaded, setIsURLLoaded] = useState(false);


    const forms = {
        journey_planner: {
            id: 'journey_planner',
            name: 'Journey Planner',
            form: JourneyPlannerForm,
            results: JourneyResults,
            map: JourneyPlannerMap,
        },
        departures: {
            id: 'departures',
            name: 'Departures',
            form: DeparturesForm,
            results: DeparturesResults,
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
        console.log("womp womp", data)
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(data)) {
            if (value.location === undefined) {
                continue;
            }
            searchParams.append(key, value.location.properties.label);
        }
        url.search = searchParams;
        window.history.replaceState(null, null, url.toString());
    }















    //plans
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
                });
            }
        });
    }

    const generatePlansQueryFromData = (planData) => {
        return generatePlansQuery(planData.from.location, planData.to.location);
    }

    const plansFormData = usePlannerFormData({
        from: {
            input: '',
        },
        to: {
            input: '',
        },
    }, updateUrl, fetchNewPlans, generatePlansQueryFromData, isURLLoaded);









    //departures
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
                });
            }
        });
    }

    const generateDeparturesQueryFromData = (planData) => {
        return generateDeparturesQuery(planData.from.location);
    }

    const departuresFormData = usePlannerFormData({
        from: {
            input: '',
        },
    }, updateUrl, fetchNewDepartures, generateDeparturesQueryFromData, isURLLoaded);










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









    const formsData = {
        journey_planner: plansFormData,
        departures: departuresFormData,
    };

    const curForm = forms[selectedForm];
    const curFormData = formsData[selectedForm];

    return (
        <div id='journey_planner'>
            <journeyPlannerContext.Provider value={{
                selectedForm: selectedForm,
                setSelectedForm: setSelectedForm,
                forms: forms,
                formsData: formsData,
                curForm: curForm,
                curFormData: curFormData,
                mapCenter: mapCenter,
                setMapCenter: setMapCenter,
                isURLLoaded: isURLLoaded,
                setIsURLLoaded: setIsURLLoaded,
            }}>
                <div id='journey_planner_planner'>
                    <JourneyPlanner selectedForm={selectedForm} setSelectedForm={setSelectedForm} forms={forms} formsData={formsData} />
                    <div id='journey_planner_results_container'>
                        <div id='journey_planner_results'>
                            <JourneyPlannerResults selectedForm={selectedForm} forms={forms} formsData={formsData} />
                        </div>
                    </div>
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
            </journeyPlannerContext.Provider>
        </div>
    );
}