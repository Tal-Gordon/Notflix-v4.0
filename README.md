# Notflix

Notflix is a web service API

The API provides endpoints for user connection, movie browsing, and recommendation functionalities. It allows users to create accounts, log in, browse categories and movies, and receive personalized movie recommendation.

## How to run

create a config folder inside NodeJS with a file named .env.local:
it should have that info:

```
CONNECTION_STRING='mongodb://127.0.0.1:27017/Notflix'
PORT=3000
HOST=host.docker.internal
```

To run both servers using docker compose:

```
docker-compose build && docker-compose up -d
```

It might takes some time for the docker to load and run (wait around 30 seconds before running commands)

# API info:

## User Management

### Create a New User

Endpoint: POST http://foo.com/api/users

Description: Creates a new user with the provided details.

Request Body (JSON):

{
"username": "string",
"password": "string",
"name": "string" _optional_,
"surname": "string" _optional_,
"profile_picture": "string"
}

Response: Returns the created user's details.

### Get User Details

Endpoint: GET http://foo.com/api/users/:id

Description: Retrieves details of a specific user by their ID.

Response: User details (e.g., username, profile picture, etc.).

### User Authentication (Login)

Endpoint: POST http://foo.com/api/tokens

Description: Authenticates a user with username and password.

Request Body (JSON):

{
"username": "string",
"password": "string"
}

Response: Returns a JSON object containing the user ID if authentication is successful, or an error message if not.

For API requests that require authentication, the user ID must be included in the request headers.

## Categorie Management

### Fetch All Categories

Endpoint: GET http://foo.com/api/categories

Description: Retrieves a list of all available movie categories.

### Create a New Category

Endpoint: POST http://foo.com/api/categories

Description: Adds a new movie category.

Request Body:

{
"name": "string" _unique_,
"promoted": "boolean" _optional_,
"movie*list": [ <movieId1>, <movieId2>, <movieId3>... ] \_optional*
}

## Movie Management & Browsing

### Retrieve, Update, or Delete a Category

Get Category by ID: GET http://foo.com/api/categories/:id

Update Category: PATCH http://foo.com/api/categories/:id

Delete Category: DELETE http://foo.com/api/categories/:id

### Get Recommended Movies & User’s Watched Movies

Endpoint: GET http://foo.com/api/movies

Description:

Returns a list of movies categorized by promoted categories.

Each promoted category returns up to 20 random movies that the user has not yet watched.

A special category contains the last 20 movies the user has watched in random order.

### Create a New Movie

Endpoint: POST http://foo.com/api/movies

Description: Adds a new movie.

Request Body:

{
"title": "string",
"categories": [ <movieId1>, <movieId2>, <movieId3>... ] _optional_
}

### Retrieve, Update, or Delete a Movie

Get Movie Details: GET http://foo.com/api/movies/:id

Update Movie: PUT http://foo.com/api/movies/:id

Delete Movie: DELETE http://foo.com/api/movies/:id

### Get Recommended Movies for a Specific Movie

Endpoint: GET http://foo.com/api/movies/:id/recommend/

Description: Returns recommended movies based on the specified movie ID and the user's viewing history.

### Mark a Movie as Watched

Endpoint: POST http://foo.com/api/movies/:id/recommend/

Description: Adds the specified movie to the user's watched list for the recommendation system.

### Search for Movies

Endpoint: GET http://foo.com/api/movies/search/:query/

Description: Searches for movies that contain the query string in any of their fields.

# Run example:

curl -i -X POST http://localhost:3000/api/users \
-H "Content-Type: application/json" \
-d '{"username": "Josh", "password": "123456"}'

HTTP/1.1 201 Created
X-Powered-By: Express
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 0

curl -i -X POST http://localhost:3000/api/movies \
-H "Content-Type: application/json" \
-d '{"title": "Fargo"}'

HTTP/1.1 201 Created
X-Powered-By: Express
Location: /api/movies/6786c5ec1f825ecb1ac52dc2
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 0

curl -i -X POST http://localhost:3000/api/categories \
-H "Content-Type: application/json" \
-d '{"name": "Drama", "promoted": true}'

HTTP/1.1 201 Created
X-Powered-By: Express
Location: /api/categories/ffc76e45-2353-4265-9e6a-29760a01f408
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 0

curl -i -X POST http://localhost:3000/api/movies/6786c5ec1f825ecb1ac52dc2/recommend \
-H "Content-Type: application/json" \
-H "id: ffc76e45-2353-4265f825ecb1ac52dc2"

HTTP/1.1 201 Created
X-Powered-By: Express
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 0
