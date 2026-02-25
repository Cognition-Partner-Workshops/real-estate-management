# Real Estate Simple API

A lightweight REST API for managing real estate property listings. Built with [Fastify](https://www.fastify.io/) and uses in-memory storage (no database required).

## Features

- CRUD operations for property listings
- Filter properties by type, transaction type, and price range
- Swagger/OpenAPI documentation at `/docs`
- Seed data included for quick testing
- Zero database setup required

## Quick Start

```bash
# Navigate to api-simple directory
cd api-simple

# Install dependencies
npm install

# Start the server
npm start

# Or use development mode with auto-reload
npm run dev
```

The API will be available at `http://localhost:3000`.

## API Endpoints

| Method   | Endpoint          | Description                          |
| -------- | ----------------- | ------------------------------------ |
| `GET`    | `/`               | Health check                         |
| `GET`    | `/properties`     | List all properties (with filters)   |
| `GET`    | `/properties/:id` | Get a single property                |
| `POST`   | `/properties`     | Create a new property                |
| `PATCH`  | `/properties/:id` | Update an existing property          |
| `DELETE` | `/properties/:id` | Delete a property                    |
| `GET`    | `/docs`           | Swagger API documentation            |

## Query Filters

`GET /properties` supports the following query parameters:

- `type` - Filter by property type: `residential`, `commercial`, `land`
- `transactionType` - Filter by transaction: `sale`, `rent`
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter

Example: `GET /properties?type=residential&transactionType=sale&minPrice=100000`

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Default   | Description     |
| -------- | --------- | --------------- |
| `PORT`   | `3000`    | Server port     |
| `HOST`   | `0.0.0.0` | Server host     |
