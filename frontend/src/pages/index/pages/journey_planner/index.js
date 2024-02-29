import './index.css';

import Leaflet from 'leaflet';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import polyline from '@mapbox/polyline';

import React, { createContext, useContext, useEffect, useRef, useState, Fragment } from 'react';

import { Bus as BusIcon, Train as TrainIcon, PointPin as PointPinIcon, Tram as TramIcon, Subway as SubwayIcon, Boat as BoatIcon, Walk as WalkIcon, ArrowRight as ArrowRightIcon, BlockShuffle as BlockShuffleIcon, Calendar as CalendarIcon, Clock as ClockIcon, SimpleArrowRight as SimpleArrowRightIcon, Map as MapIcon, TriangleArrowLeft as TriangleArrowLeftIcon, ArrowLeft as ArrowLeftIcon } from '../../../../svg';

const journeyPlannerContext = createContext();
const formDataContext = createContext();
const displayContext = createContext();

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








function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}



function addPlural(num) {
    if (num === 1) {
        return '';
    } else {
        return 's';
    }
}



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

function validateHourMinDate(date) {
    let hoursStr;
    let minutesStr;

    if (date.includes(':')) {
        [hoursStr, minutesStr] = date.split(':');
    } else {
        hoursStr = date.substring(0, 2);
        minutesStr = date.substring(2, 4);
    }

    const fix = (str, isLeft) => {
        if (str.length === 0) {
            return '00';
        } else if (str.length === 1) {
            return isLeft ? `${str}0` : `0${str}`;
        } else if (str.length > 2) {
            return str.substring(0, 2);
        }
        return str;
    }

    hoursStr = fix(hoursStr, false);
    minutesStr = fix(minutesStr, true);

    let hours = parseInt(hoursStr);
    let minutes = parseInt(minutesStr);

    if (isNaN(hours)) {
        hours = 0;
    }

    if (isNaN(minutes)) {
        minutes = 0;
    }

    hours = clamp(hours, 0, 23);
    minutes = clamp(minutes, 0, 59);

    return [hours, minutes];
}

function validateDate(date) {
    //TODO: fix this
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
        //skibidi toilet
        //rizz was here
        //gyatt toilet
        //jeg hater oransje hvit tekst i en linje i en linje i en linje i en linje. skibidi toilet 
        //kai cent
        //gyatt toilet
        durationString += minutes + 'm';
    }

    if (durationString === '') {
        durationString = '< 1m';
    }

    return durationString;
}


function getDate(date) {
    return `${fillEmptyDate(date.getDate())}.${fillEmptyDate(date.getMonth() + 1)}.${date.getFullYear()}`
}




function RailPlatformIcon({ platform }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 30" width="26" height="30" preserveAspectRatio="xMidYMid">
            <g transform="translate(3,0)">
                <rect x="-3" y="0" style={{
                    visibility: 'hidden',
                }} fill="#59C5FC" width="26" height="26" rx="13" ry="13"></rect>
                <rect x="-1" y="2" fill="white" width="22" height="22" rx="12" ry="12"></rect>
                <g transform="translate(10,13)">
                    <rect style={{
                        visibility: 'hidden',
                    }} transform="rotate(45)" fill="#59C5FC" width="13" height="13"></rect>
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
                <rect x="-3" y="0" style={{
                    visibility: 'hidden',
                }} fill="#59C5FC" width="26" height="26" rx="13" ry="13"></rect>
                <rect x="-1" y="2" fill="#252525" width="22" height="22" rx="12" ry="12"></rect>
                <g transform="translate(10,13)">
                    <rect style={{
                        visibility: 'hidden',
                    }} transform="rotate(45)" fill="#59C5FC" width="13" height="13"></rect>
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
        }).catch((err) => {
            console.warn('Failed to fetch suggestions', err);
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
                <div className={`journey_planner_form_place_input_main fancy_input fancy_input_no_border_radius${displaySuggestions ? ' journey_planner_form_place_input_main_focused' : ''}`}>
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

function usePlannerFormData(planData, setPlanData, selectedResult, setSelectedResult, fetchResults, generateQuery) {
    const { updateUrl, isURLLoaded, timeInput } = useContext(journeyPlannerContext);

    const [curPlanQuery, setCurPlanQuery] = useState();
    const [plans, setPlans] = useState();

    const fetchNewPlans = () => {
        setSelectedResult(0);
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
    }, [...Object.values(planData).map((plan) => plan.location), isURLLoaded, timeInput]);

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
    const { selectedForm, setIsResultsLoading, setResults, setIsURLLoaded, inputs, setInputs, selectedResults, setSelectedResults, setDisplayResults, timeInput } = useContext(journeyPlannerContext);

    const fetchNewPlans = (setPlans, body) => {
        setIsResultsLoading(true);
        //TODO: use V3 instead of V2
        fetch('/api/journeyplanner', {
            method: 'POST',
            headers: {
                'ET-Client-Name': 'joe_biden',
                'Content-Type': 'application/json',
            },
            body: body,
        }).then((res) => {
            setIsResultsLoading(false);
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
                    setDisplayResults((prev) => {
                        return {
                            ...prev,
                            [selectedForm]: true,
                        };
                    });
                });
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    const generatePlansQueryFromData = (planData) => {
        return {
            from: planData.from,
            to: planData.to,
            dateTime: timeInput,
        };
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
            }).catch((err) => {
                console.error(err);
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
            <h2 className='journey_planner_form_title'>
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

function JourneyResults({ onResultClicked, results }) {
    const { selectedForm, setSelectedResults } = useContext(journeyPlannerContext);

    return results?.data.trip.tripPatterns.map((journey, index) => {
        const startTime = new Date(journey.startTime);
        const endTime = new Date(journey.endTime);
        return (
            <button key={index} className='journey_planner_result' onClick={(e) => {
                setSelectedResults((prev) => {
                    return {
                        ...prev,
                        [selectedForm]: index,
                    };
                });
                onResultClicked(e, journey, index);
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

function JourneyPlannerSelectedResultWalk({ leg }) {
    const expectedStartTime = new Date(leg.expectedStartTime);
    const aimedStartTime = new Date(leg.aimedStartTime);

    const expectedEndTime = new Date(leg.expectedEndTime);
    const aimedEndTime = new Date(leg.aimedEndTime);

    return (
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
}

function JourneyPlannerSelectedResultTransport({ leg }) {
    const [showStops, setShowStops] = useState(false);

    const fromEstimatedCall = leg.fromEstimatedCall;

    const expectedDepartureTime = new Date(fromEstimatedCall.expectedDepartureTime);
    const aimedDepartureTime = new Date(fromEstimatedCall.aimedDepartureTime);

    const toEstimatedCall = leg.toEstimatedCall;

    const expectedArrivalTime = new Date(toEstimatedCall.expectedArrivalTime);
    const aimedArrivalTime = new Date(toEstimatedCall.aimedArrivalTime);

    return (
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
            {leg.intermediateEstimatedCalls.length > 0 ? (
                <>
                    <JourneySelectedResultSegmentRow
                        middle={
                            <JourneySelectedResultLineMiddle color={`#${leg.serviceJourney.line.presentation.colour}`} />
                        }
                        right={
                            leg.intermediateEstimatedCalls.length > 0 ? (
                                <button className='journey_planner_selected_result_segment_row_right_stops' onClick={() => {
                                    setShowStops(showStops === false);
                                }}>
                                    <div className='journey_planner_selected_result_segment_row_right_stops_icon' style={{
                                        '--journey-planner-selected-result-segment-row-right-stops-icon-color': `#${leg.serviceJourney.line.presentation.colour}`,
                                    }}>

                                    </div>
                                    <div className='journey_planner_selected_result_segment_row_right_stops_stops'>
                                        {leg.intermediateEstimatedCalls.length} stop{addPlural(leg.intermediateEstimatedCalls.length)}
                                    </div>
                                </button>
                            ) : undefined
                        }
                    />
                    {showStops ? (
                        <>
                            <JourneySelectedResultSegmentRow
                                middle={
                                    <JourneySelectedResultLineMiddle color={`#${leg.serviceJourney.line.presentation.colour}`} />
                                }
                                right={
                                    <div className='journey_planner_selected_result_segment_row_intermediate_stops_space'>

                                    </div>
                                }
                            />
                            {leg.intermediateEstimatedCalls.map((stop, index) => {
                                return (
                                    <JourneySelectedResultSegmentRow
                                        key={index}
                                        left={
                                            <div className='journey_planner_selected_result_segment_row_intermediate_stop_time'>
                                                {getHourMinDate(new Date(stop.expectedArrivalTime))}
                                            </div>
                                        }
                                        middle={
                                            <JourneySelectedResultLineMiddle color={`#${leg.serviceJourney.line.presentation.colour}`} />
                                        }
                                        right={
                                            <div className='journey_planner_selected_result_segment_row_intermediate_stop_quay'>
                                                {stop.quay.name}
                                            </div>
                                        }
                                    />
                                );
                            })}
                            <JourneySelectedResultSegmentRow
                                middle={
                                    <JourneySelectedResultLineMiddle color={`#${leg.serviceJourney.line.presentation.colour}`} />
                                }
                                right={
                                    <div className='journey_planner_selected_result_segment_row_intermediate_stops_space'>

                                    </div>
                                }
                            />
                        </>
                    ) : undefined}
                </>
            ) : undefined}
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

function JourneySelectedResult({ result, selectedResult }) {
    const selectedJourney = result?.data.trip.tripPatterns[selectedResult];
    return (
        <div id='journey_planner_planner_selected_result'>
            <div id='journey_planner_selected_result_segments'>
                {selectedJourney?.legs.map((leg, index) => {
                    const mode = leg.mode;

                    let content;

                    if (mode === 'foot') {
                        content = (
                            <JourneyPlannerSelectedResultWalk leg={leg} />
                        );
                    } else {
                        content = (
                            <JourneyPlannerSelectedResultTransport leg={leg} />
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

        if (curResults?.data !== undefined && curResults.data.trip.tripPatterns.length !== 0) {
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
    const { selectedForm, setIsResultsLoading, setResults, setIsURLLoaded, inputs, setInputs, selectedResults, setSelectedResults, setDisplayResults } = useContext(journeyPlannerContext);

    const fetchNewDepartures = (setPlans, body) => {
        setIsResultsLoading(true);
        fetch('/api/departures', {
            method: 'POST',
            headers: {
                'ET-Client-Name': 'joe_biden',
                'Content-Type': 'application/json',
            },
            body: body,
        }).then((res) => {
            setIsResultsLoading(false);
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
                    /*
                    setDisplayResults((prev) => {
                        return {
                            ...prev,
                            [selectedForm]: true,
                        };
                    });
                    */
                });
            }
        }).catch((err) => {
            console.warn('Departures error.', err);
        });
    }

    const generateDeparturesQueryFromData = (planData) => {
        return {
            from: planData.from,
        };
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
            }).catch((err) => {
                console.error(err);
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
    }, [selectedResults[selectedForm]]);

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
            <h2 className='journey_planner_form_title'>
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

function DeparturesResults({ onResultClicked, results }) {
    const { selectedForm, setSelectedResults } = useContext(journeyPlannerContext);

    return results?.data.stopPlace?.quays.map((quay, index) => {
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

        let quayName;
        if (quay.publicCode || quay.description) {
            quayName = `Plattform${quay.publicCode ? ` ${quay.publicCode}` : ''}${quay.description ? ` ${quay.description}` : ''}`;
        } else {
            quayName = quay.name;
        }

        return (
            <button key={index} className='journey_planner_result' onClick={(e) => {
                setSelectedResults((prev) => {
                    return {
                        ...prev,
                        [selectedForm]: index,
                    };
                });
                onResultClicked(e, quay, index);
            }}>
                <div className='journey_planner_departure_platform'>
                    {quayName}
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
    }, [selectedResults[selectedForm], curResults, map]);

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
function JourneyPlannerResults({ onResultClicked }) {
    const { selectedForm, forms, results } = useContext(journeyPlannerContext);
    return (
        <>
            {React.createElement(forms[selectedForm].results, {
                results: results[selectedForm],
                onResultClicked: onResultClicked,
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

function JourneyPlannerFormTimeTypeButton({ children, buttonTimeType, onButtonClick }) {
    const { timeType, setTimeType } = useContext(journeyPlannerContext);
    return (
        <button className={`journey_planner_form_time_type_button${timeType === buttonTimeType ? ' journey_planner_form_time_type_button_selected' : ''}`} onClick={(e) => {
            setTimeType(buttonTimeType);
            if (onButtonClick) {
                onButtonClick(e);
            }
        }}>
            {children}
        </button>
    );
}

function JourneyPlanner() {
    const { selectedForm, setSelectedForm, forms, curForm, timeInput, setTimeInput, timeType, setTimeType } = useContext(journeyPlannerContext);

    const [dateTextInput, setDateTextInput] = useState(getDate(timeInput));
    const [timeTextInput, setTimeTextInput] = useState(getHourMinDate(timeInput));

    useEffect(() => {
        setDateTextInput(getDate(timeInput));
        setTimeTextInput(getHourMinDate(timeInput));
    }, [timeInput]);

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
                <div id='journey_planner_planner_form_main'>
                    {React.createElement(curForm.form)}
                </div>
                {selectedForm === 'journey_planner' ? (
                    <div id='journey_planner_planner_form_time'>
                        <h2 className='journey_planner_form_title'>
                            When do you want to travel?
                        </h2>
                        <div id='journey_planner_form_time_content'>
                            <div id='journey_planner_form_time_type_buttons'>
                                <JourneyPlannerFormTimeTypeButton buttonTimeType={'now'} onButtonClick={() => {
                                    setTimeInput(new Date());
                                }}>
                                    Now
                                </JourneyPlannerFormTimeTypeButton>
                                <JourneyPlannerFormTimeTypeButton buttonTimeType={'departure'}>
                                    Departure
                                </JourneyPlannerFormTimeTypeButton>
                                <JourneyPlannerFormTimeTypeButton buttonTimeType={'arrival'}>
                                    Arrival
                                </JourneyPlannerFormTimeTypeButton>
                            </div>
                            <div id='journey_planner_form_time_inputs'>
                                <div id='journey_planner_form_time_inputs_date' className='journey_planner_form_time_input_container fancy_input'>
                                    <input id='journey_planner_form_time_inputs_date_text' className='journey_planner_form_time_input_input' value={dateTextInput} onChange={(e) => {
                                        setDateTextInput(e.target.value);
                                    }} onBlur={() => {
                                        const newDate = new Date(timeInput.valueOf());
                                        //const [day, month, year] = validateDate(dateTextInput);

                                        const [dayStr, monthStr, yearStr] = dateTextInput.split('.');
                                        let day = parseInt(dayStr);
                                        let month = parseInt(monthStr);
                                        let year = parseInt(yearStr);
                                        if (isNaN(day)) {
                                            day = newDate.getDate();
                                        }
                                        if (isNaN(month)) {
                                            month = newDate.getMonth() + 1;
                                        }
                                        if (isNaN(year)) {
                                            year = newDate.getFullYear();
                                        }

                                        newDate.setDate(day);
                                        newDate.setMonth(month - 1);
                                        newDate.setFullYear(year);
                                        setTimeInput(newDate);
                                        setDateTextInput(getDate(newDate));
                                    }} />
                                    <div className='journey_planner_form_time_input_icon'>
                                        <CalendarIcon />
                                    </div>
                                </div>
                                <div id='journey_planner_form_time_inputs_time' className='journey_planner_form_time_input_container fancy_input'>
                                    <input id='journey_planner_form_time_inputs_time_text' className='journey_planner_form_time_input_input' value={timeTextInput} onChange={(e) => {
                                        setTimeTextInput(e.target.value);
                                    }} onBlur={() => {
                                        const newDate = new Date(timeInput.valueOf());
                                        const [hours, minutes] = validateHourMinDate(timeTextInput);
                                        newDate.setHours(hours);
                                        newDate.setMinutes(minutes);
                                        setTimeInput(newDate);
                                        setTimeTextInput(getHourMinDate(newDate));
                                    }} />
                                    <div className='journey_planner_form_time_input_icon'>
                                        <ClockIcon />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : undefined}
            </div>
        </div>
    );
}

function JourneyPlannerMobileHudButton({ children, ...props }) {
    return (
        <button className='journey_planner_mobile_hud_button' {...props}>
            {children}
        </button>
    );
}

function JourneyPlannerMobileHud({ left, right }) {
    return (
        <div className='journey_planner_mobile_hud_container'>
            <div className='journey_planner_mobile_hud_left'>
                {left}
            </div>
            <div className='journey_planner_mobile_hud_right'>
                {right}
            </div>
        </div>
    );
}

function JourneyPlannerPlannerSection({ onResultClicked }) {
    const { selectedForm, setSelectedForm, forms, isResultsLoading } = useContext(journeyPlannerContext);
    return (
        <div id='journey_planner_planner'>
            <JourneyPlanner selectedForm={selectedForm} setSelectedForm={setSelectedForm} forms={forms} />
            <div id='journey_planner_results_container'>
                {isResultsLoading ? (
                    <div id='journey_planner_results_loading'>
                        <BlockShuffleIcon />
                        <div id='journey_planner_results_loading_text'>
                            Cooking up journey
                        </div>
                    </div>
                ) : (
                    <div id='journey_planner_results'>
                        <JourneyPlannerResults onResultClicked={onResultClicked} />
                    </div>
                )}
            </div>
        </div>
    );
}

function JourneyPlannerSelectedResultSection() {
    const { selectedForm, displayResults } = useContext(journeyPlannerContext);
    const { displayType, setCurPage } = useContext(displayContext);
    return displayResults[selectedForm] ? (
        <>
            <div id='journey_planner_selected_result'>
                <JourneyPlannerSelectedResult />
            </div>
            {displayType === 'mobile' ? (
                <JourneyPlannerMobileHud left={
                    <JourneyPlannerMobileHudButton onClick={() => setCurPage('planner')}>
                        <ArrowLeftIcon />
                    </JourneyPlannerMobileHudButton>
                } right={
                    <JourneyPlannerMobileHudButton onClick={() => setCurPage('content')}>
                        <MapIcon />
                    </JourneyPlannerMobileHudButton>
                } />
            ) : undefined}
        </>
    ) : undefined;
}

function JourneyPlannerContentSection() {
    const { curForm, mapCenter } = useContext(journeyPlannerContext);
    const { displayType, setCurPage } = useContext(displayContext);
    return (
        <>
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
            {displayType === 'mobile' ? (
                <JourneyPlannerMobileHud left={
                    <JourneyPlannerMobileHudButton onClick={() => setCurPage('result')}>
                        <ArrowLeftIcon />
                    </JourneyPlannerMobileHudButton>
                } />
            ) : undefined}
        </>
    );
}

function JourneyPlannerDisplayDesktop() {
    const { curForm } = useContext(journeyPlannerContext);
    return React.createElement(curForm.container, {}, (
        <displayContext.Provider value={{
            displayType: 'desktop',
        }}>
            <JourneyPlannerPlannerSection />
            <JourneyPlannerSelectedResultSection />
            <JourneyPlannerContentSection />
        </displayContext.Provider>
    ));
}

function JourneyPlannerDisplayMobile() {
    const { curForm } = useContext(journeyPlannerContext);
    const [curPage, setCurPage] = useState('planner');
    return React.createElement(curForm.container, {}, (
        <displayContext.Provider value={{
            displayType: 'mobile',
            curPage,
            setCurPage,
        }}>
            {curPage === 'planner' ? (
                <JourneyPlannerPlannerSection onResultClicked={() => {
                    setCurPage('result');
                }} />
            ) : curPage === 'result' ? (
                <JourneyPlannerSelectedResultSection />
            ) : curPage === 'content' ? (
                <JourneyPlannerContentSection />
            ) : undefined}
        </displayContext.Provider>
    ));
}

export default function Index() {
    const [displayType, setDisplayType] = useState('desktop');

    const [selectedForm, setSelectedForm] = useState('journey_planner');
    const [isURLLoaded, setIsURLLoaded] = useState(false);
    const [isResultsLoading, setIsResultsLoading] = useState(false);

    const [timeInput, setTimeInput] = useState(new Date());
    const [timeType, setTimeType] = useState('now');

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

    const [displayResults, setDisplayResults] = useState({
        journey_planner: false,
        departures: false,
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

    useEffect(() => {
        const resizeHandler = () => {
            if (window.innerWidth < 768) {
                if (displayType !== 'mobile') {
                    setDisplayType('mobile');
                }
            } else {
                if (displayType !== 'desktop') {
                    setDisplayType('desktop');
                }
            }
        }

        resizeHandler();

        window.addEventListener('resize', resizeHandler);

        return () => {
            window.removeEventListener('resize', resizeHandler);
        }
    });


    useEffect(() => {
        const now = new Date();
        const isDiff = now.getFullYear() !== timeInput.getFullYear() || now.getMonth() !== timeInput.getMonth() || now.getDate() !== timeInput.getDate() || now.getHours() !== timeInput.getHours() || now.getMinutes() !== timeInput.getMinutes();
        if (timeType === 'now') {
            if (isDiff) {
                setTimeType('departure');
            }
        } else {
            if (isDiff === false) {
                setTimeType('now');
            }
        }
    }, [timeInput]);


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
                isResultsLoading: isResultsLoading,
                setIsResultsLoading: setIsResultsLoading,
                timeInput: timeInput,
                setTimeInput: setTimeInput,
                timeType: timeType,
                setTimeType: setTimeType,
                displayResults: displayResults,
                setDisplayResults: setDisplayResults,
                mapCenter: mapCenter,
                setMapCenter: setMapCenter,
                displayType: displayType,
            }}>
                {displayType === 'desktop' ? (
                    <JourneyPlannerDisplayDesktop />
                ) : displayType === 'mobile' ? (
                    <JourneyPlannerDisplayMobile />
                ) : undefined}
            </journeyPlannerContext.Provider>
        </div>
    );
}