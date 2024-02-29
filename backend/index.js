console.log('Node server started');

const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');

const IP = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 80;








function checkValuePresent(val) {
    if (val === undefined) {
        return false;
    }
    if (val === null) {
        return false;
    }
    return true;
}

function checkValueType(val, type) {
    let bool;
    if (type === 'array') {
        bool = typeof (val) !== 'object' || Array.isArray(val) === false;
    } else if (type === 'object') {
        bool = typeof (val) !== 'object' || Array.isArray(val) === true;
    } else {
        bool = typeof (val) !== type;
    }
    if (bool) {
        return false;
    }
    return true;
}

function checkValueFull(val, type) {
    const isPresent = checkValuePresent(val);
    if (isPresent === false) {
        return false;
    }
    const isValidType = checkValueType(val, type);
    if (isValidType === false) {
        return false;
    }
    return true;
}




function checkValueWithFallback(val, type, fallback) {
    const isValid = checkValueFull(val, type);
    if (isValid === true) {
        return val;
    }
    return fallback;
}







function checkRequestValuePresent(res, val, index) {
    if (val === undefined) {
        res.status(400).send(JSON.stringify({
            unexpected: true,
            message: `${index} is undefined.`,
        }));
        return false;
    }
    if (val === null) {
        res.status(400).send(JSON.stringify({
            unexpected: true,
            message: `${index} is null.`,
        }));
        return false;
    }
    return true;
}

function checkRequestValueType(res, val, index, type) {
    let bool;
    if (type === 'array') {
        bool = typeof (val) !== 'object' || Array.isArray(val) === false;
    } else if (type === 'object') {
        bool = typeof (val) !== 'object' || Array.isArray(val) === true;
    } else {
        bool = typeof (val) !== type;
    }
    if (bool) {
        res.status(400).send(JSON.stringify({
            unexpected: true,
            message: `${index} isn't of type ${type}.`,
        }));
        return false;
    }
    return true;
}

function checkRequestValueFull(res, val, index, type) {
    const isPresent = checkRequestValuePresent(res, val, index);
    if (isPresent === false) {
        return false;
    }
    const isValidType = checkRequestValueType(res, val, index, type);
    if (isValidType === false) {
        return false;
    }
    return true;
}








function generateDeparturesQuery(stopPlace, numberOfDepartures = 500, numberOfDeparturesPerLineAndDestinationDisplay = 1, numberOfSubsequentEstimatedCalls = 6) {
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
            "numberOfDepartures": numberOfDepartures,
            "numberOfDeparturesPerLineAndDestinationDisplay": numberOfDeparturesPerLineAndDestinationDisplay,
            "numberOfSubsequentEstimatedCalls": numberOfSubsequentEstimatedCalls,
            "id": stopPlace.location.properties.id,
        },
    };
}

function generatePlansQuery(from, to, numTripPatterns, walkSpeed, walkReluctance, dateTime, arriveBy, modes, transportSubmodes, minimumTransferTime, preferred, banned) {
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
            "numTripPatterns": numTripPatterns,
            "walkSpeed": walkSpeed,
            "walkReluctance": walkReluctance,
            "from": {
                "place": `${from.location.properties.id}`,
                "coordinates": {
                    "longitude": from.location.geometry.coordinates[0],
                    "latitude": from.location.geometry.coordinates[1]
                }
            },
            "to": {
                "place": `${to.location.properties.id}`,
                "coordinates": {
                    "longitude": to.location.geometry.coordinates[0],
                    "latitude": to.location.geometry.coordinates[1]
                }
            },
            "dateTime": dateTime,
            "arriveBy": arriveBy,
            "modes": modes,
            "transportSubmodes": transportSubmodes,
            "minimumTransferTime": minimumTransferTime,
            "preferred": preferred,
            "banned": banned,
        }
    };
}











const app = express();

const server = http.createServer(app);

server.listen(PORT, IP, () => {
    const serverAddress = server.address();
    const serverAddressUrl = `http://${serverAddress.address}:${serverAddress.port}`;

    console.log(`Node server listening to: ${serverAddressUrl}`);
});




const API_URL_EXTENSION = '/api';

function getAPIURL(url) {
    return API_URL_EXTENSION + url;
}


const APIURLS = [
    getAPIURL('/journeyplanner'),
    getAPIURL('/departures'),
];





app.use(cors());
app.use('/', express.static(path.join(__dirname, 'build')));
app.use(express.json({ limit: '5mb' }));





const ipRequests = {};


app.use((req, res, next) => {
    const ip = req.socket.remoteAddress;
    let curRequests = ipRequests[ip];
    if (curRequests === undefined) {
        curRequests = {
            ip: ip,
            requests: {
                content: [],
                api: [],
            },
        };
        ipRequests[ip] = curRequests;
    }
    const curIsAPI = APIURLS.includes(req.path);
    let requestType;
    let maxRate;
    if (curIsAPI === true) {
        requestType = 'api';
        maxRate = 3000;//30;
    } else if (curIsAPI === false) {
        requestType = 'content';
        maxRate = 1000;
    }
    const requests = curRequests.requests[requestType];
    const now = Date.now();
    const pushRequest = () => {
        requests.push({
            url: req.url,
            date: now,
        });
        next();
    }
    if (requests.length > 0) {
        let amount = 0;
        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            if ((now - request.date) <= 60 * 1000) {
                amount += 1;
            }
        }
        if (amount <= maxRate) {
            pushRequest();
        } else {
            res.status(429).send(JSON.stringify({
                unexpected: true,
                message: `Too many requests.`,
            }));
        }
    } else {
        pushRequest();
    }
});



function isDateISOValid(iso) {
    const date = new Date(iso);
    return date.toISOString() === iso;
}




app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'build', 'index.html'));
});


function validateLocation(res, str, loc) {
    if (checkRequestValueFull(res, loc, str, 'object') === false) return;
    if (checkRequestValueFull(res, loc.location, `${str}.location`, 'object') === false) return;
    if (checkRequestValueFull(res, loc.location.properties, `${str}.location.properties`, 'object') === false) return false;
    if (checkRequestValueFull(res, loc.location.properties.id, `${str}.location.properties.id`, 'string') === false) return false;
    if (checkRequestValueFull(res, loc.location.geometry, `${str}.location.geometry`, 'object') === false) return false;
    if (checkRequestValueFull(res, loc.location.geometry.coordinates, `${str}.location.geometry.coordinates`, 'array') === false) return false;
    if (checkRequestValueFull(res, loc.location.geometry.coordinates[0], `${str}.location.geometry.coordinates[0]`, 'number') === false) return false;
    if (checkRequestValueFull(res, loc.location.geometry.coordinates[1], `${str}.location.geometry.coordinates[1]`, 'number') === false) return false;
    return true;
}


app.post(getAPIURL('/journeyplanner'), (req, res) => {
    const body = req.body;

    const from = body.from;
    if (validateLocation(res, 'from', from) === false) return;

    const to = body.to;
    if (validateLocation(res, 'to', to) === false) return;

    const numTripPatterns = checkValueWithFallback(body.numTripPatterns, 'number', 5);
    const walkSpeed = checkValueWithFallback(body.walkSpeed, 'number', new Date());
    const walkReluctance = checkValueWithFallback(body.walkReluctance, 'number', new Date());
    const dateTime = checkValueWithFallback(body.dateTime, (v) => isDateISOValid(), new Date());
    const arriveBy = checkValueWithFallback(body.arriveBy, 'boolean', false);
    const modes = checkValueWithFallback(body.modes, 'array', [
        "coach",
        "bus",
        "metro",
        "tram",
        "rail",
        "water",
        "foot",
    ]);
    const transportSubmodes = checkValueWithFallback(body.transportSubmodes, 'array', []);
    const minimumTransferTime = checkValueWithFallback(body.minimumTransferTime, 'number', 0);
    // const preferred = checkValueWithFallback(body.preferred, 'date', new Date());
    // const banned = checkValueWithFallback(body.banned, 'date', new Date());

    fetch('https://api.entur.io/journey-planner/v2/graphql', {
        method: 'POST',
        headers: {
            'ET-Client-Name': 'joe_biden',
            'Content-Type': 'application/json',
        },
        body: generatePlansQuery(from, to, numTripPatterns, walkSpeed, walkReluctance, dateTime, arriveBy, modes, transportSubmodes, minimumTransferTime/*, preferred, banned*/),
    }).then((foundRes) => {
        if (foundRes.ok) {
            foundRes.json().then((data) => {
                if (data.errors) {
                    console.warn('Trip error:\n', data.errors);
                    return;
                }
                res.status(200).send(data);
            });
        } else {
            foundRes.text().then((data) => {
                res.status(500).send(data);
            });
        }
    }).catch((err) => {
        console.error(err);
        res.status(500).send();
    });
});

app.post(getAPIURL('/departures'), (req, res) => {
    const body = req.body;

    const from = body.from;
    if (validateLocation(res, 'from', from) === false) return;

    console.log("skibidi?")

    fetch('https://api.entur.io/journey-planner/v3/graphql', {
        method: 'POST',
        headers: {
            'ET-Client-Name': 'joe_biden',
            'Content-Type': 'application/json',
        },
        body: generateDeparturesQuery(from),
    }).then((foundRes) => {
        if (foundRes.ok) {
            foundRes.json().then((data) => {
                if (data.errors) {
                    console.warn('Departures error:\n', data.errors);
                    return;
                }
                res.status(200).send(data);
            });
        } else {
            foundRes.text().then((data) => {
                console.warn('Departures fetch error:\n', data);
                res.status(500).send(data);
            });
        }
    }).catch((err) => {
        console.error(err);
        res.status(500).send();
    });
});



app.get('*', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'build', 'index.html'));
});