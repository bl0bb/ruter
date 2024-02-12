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
    // getAPIURL('/someapi'),
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





app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'build', 'index.html'));
});

//yap APIer her

app.get('*', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'build', 'index.html'));
});