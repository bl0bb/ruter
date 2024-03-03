# Backend Documentation

This documentation provides an overview of the Node.js backend code designed to serve as a server for handling requests related to journey planning and departure information. 

## Initialization

The backend code initializes a Node server and listens for incoming requests. It utilizes the Express framework for handling HTTP requests and responses.

```javascript
console.log('Node server started');

const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');

const IP = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 80;

const app = express();
const server = http.createServer(app);

server.listen(PORT, IP, () => {
    const serverAddress = server.address();
    const serverAddressUrl = `http://${serverAddress.address}:${serverAddress.port}`;
    console.log(`Node server listening to: ${serverAddressUrl}`);
});
```

## Request Rate Limiting

The backend includes request rate limiting functionality to prevent abuse and ensure server stability.

### IP-based Rate Limiting

Requests from each IP address are tracked, and requests exceeding a certain threshold are rejected with a 429 Too Many Requests status code.

### Rate Limit Configuration

- API requests have a maximum rate of 3000 requests per minute.
- Non-API (content) requests have a maximum rate of 1000 requests per minute.

## API Endpoints

The backend exposes the following API endpoints for journey planning and departure information:

1. `/api/journeyplanner`: Endpoint for journey planning.
2. `/api/departures`: Endpoint for fetching departure information.

## Request Handling

### Journey Planning

The backend handles POST requests to /api/journeyplanner. The request body should contain parameters for journey planning, including origin, destination, date, etc. It sends a GraphQL query to the Entur Journey Planner API.

### Departures Information

The backend handles POST requests to /api/departures. Similar to journey planning, the request body should contain the necessary parameters. It sends a GraphQL query to the Entur Departures API.

## Rate Limiting and Error Handling

The backend ensures proper rate limiting and error handling to maintain server stability and provide meaningful responses to clients.

## Static Content

Additionally, the backend serves static content located in the `/build` directory.

### Default Route

For any other routes, the backend serves the index.html file to support client-side routing in the React application.

## Dependencies

The backend relies on the following dependencies:

- `express`: Web application framework for Node.js.
- `cors`: Middleware for enabling CORS (Cross-Origin Resource Sharing).
- `http`: Core module for creating HTTP servers.
- `path`: Core module for working with file and directory paths.

## License

This project is licensed under the MIT license.