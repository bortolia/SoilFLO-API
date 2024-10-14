# Run Instructions and Details

- A postman collection is included in the `/postman` directory with prepopulated headers and request body/parameters to test the API
- The details pertaining to each route follow the Install, Seed, Run and Test instructions below
- See NOTE regarding protected routes

By default, the REST API will be served at `http://localhost:3003`

There are 2 defined entry points:

- `POST /api/tickets/bulk`
- `GET /api/tickets?startDate=<date>&endDate=<date>&sites=<sitesList>`

Metrics are exposed via Prometheus at:

- `GET /metrics`

### Install

```
npm install
```

### Seed DB

- The database must be seeded initially, and can be reseeded to the original state reflecting `SitesJSONData.json` and `TrucksJSONData.json` by running the following command

```
npm run seed
```

### Run Locally

```
npm run dev
```

### Run Tests

```
npm test
```

### NOTE

- API routes (not including `/metrics`) are protected using Basic Authorization headers
- To access routes, use the defualt credentials: `admin:secret123`
- These are set in the config directory
- Headers: `{ Authorization: 'Basic YWRtaW46c2VjcmV0MTIz' }`

## Create Tickets In Bulk For A Truck

### Request

`POST /api/tickets/bulk`

```
http://localhost:3003/api/tickets/bulk
```

#### Request Body Shape

- All fields are required
- `tickets` array must contain at least 1 item

```
{
    truckId: number;
    tickets: [
        {
            dispatchedTime: string;
            siteId: number;
        },
    ]
}
```

#### Example Request Body

```
{
    "truckId": 41,
    "tickets": [
        { "dispatchedTime": "2024-01-05T04:00:00.010Z", "siteId": 1 },
        { "dispatchedTime": "2024-06-05T04:00:00.010Z", "siteId": 21 }
    ]
}
```

### Response

```
Status: 201 Created

[
    {
        "id": 17,
        "siteId": 1,
        "truckId": 41,
        "dispatchedTime": "2024-01-05T04:00:00.010Z",
        "material": "Soil",
        "updatedAt": "2024-05-30T07:40:42.874Z",
        "createdAt": "2024-05-30T07:40:42.874Z",
        "ticketNumber": 13
    },
    {
        "id": 18,
        "siteId": 21,
        "truckId": 41,
        "dispatchedTime": "2024-06-05T04:00:00.010Z",
        "material": "Soil",
        "updatedAt": "2024-05-30T07:40:42.911Z",
        "createdAt": "2024-05-30T07:40:42.911Z",
        "ticketNumber": 3
    }
]
```

## Get All Tickets (with optional filters)

### Request

`GET /api/tickets?startDate=<date>&endDate=<date>&sites=<sitesList>`

```
http://localhost:3003/api/tickets?startDate=<date>&endDate=<date>&sites=<sitesList>
```

#### Query Params

- `date` format: `YYYY-MM-DD`
- `sitesList` format: `1` or `1,11,21`

```
  startDate = 2024-06-28
  endDate = 2024-06-30
  sites = 1,11,21
```

### Response

```
Status: 200 OK

[
    {
        "siteName": "MATRIXITY",
        "truckLicense": "3spej",
        "ticketNumber": 1,
        "ticketDispatchedTime": "2024-06-28T04:00:00.010Z",
        "ticketMaterial": "Soil"
    }
]
```
