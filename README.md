# Notflix

Notflix is a movie streaming website and android app

the app have a home screen for guests, homescreen for users, and an admin page for adding and changing categories and movies.
in the app users can see movies organized by catagories (including watched movies), see movie's information and stream a movie of choice.
users can also search for movies, by title, actors and more in the home screen.

web pages:

guest page:

```
http://localhost:3000/
```

signup page:

```
http://localhost:3000/signup
```

signin page:

```
http://localhost:3000/signin
```

home screen for users:

```
http://localhost:3000/browse
```

admin page for adding and updating categories and movies:

```
http://localhost:3000/signin
```

## How to run

create a config folder inside NodeJS with a file named .env.local:
it should have that info with the last line being a JSON Web Token:

```
CONNECTION_STRING='mongodb://127.0.0.1:27017/Notflix'
PORT=3000
HOST=host.docker.internal
JWT_SECRET="jbpQczHYyhU2J0ZCHVz8SUrf3UdsKbdkwwGkScdhwXSG8BFMduLEcD8d24PBXu8C"
```

To run both servers using docker compose:

```
docker-compose build && docker-compose up -d
```

To run both the frontend: (move the build out):

```
cd src/react-frontend
npm i
npm start
```

To run both the frontend with the build: (move the build out)

```
npm install -g serve
serve -s build
```

the webpage should open up automatically but if it fails go to:

```
http://localhost:3000/
```

to open the app:

It might takes some time for the docker to load and run (wait around 30 seconds before running commands)
