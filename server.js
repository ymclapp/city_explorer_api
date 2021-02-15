'use strict';

require('dotenv').config();


const express = require('express');
const app = express();

const cors = require('cors');

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(cors());


app.get('/', (request, response) => {
  response.send('You have found the home page! ');
});

app.get('/location', (request, response) => {
  const theDataArrayFromTheLocationJson = require('./data/location.json');
  const theDataOjbFromJson = theDataArrayFromTheLocationJson[0];

  const searchedCity = request.query.city;

  const newLocation = new Location (
    searchedCity,
    theDataOjbFromJson.display_name,
    theDataOjbFromJson.lat,
    theDataOjbFromJson.lon
  );
  response.send(newLocation);

});

app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

app.listen(PORT,() => console.log(`Listening on port ${PORT}`));

function Location(searchedCity, display_name, lat, lon) { //<<--this is saying that it needs city and geoData to be able to run the constructor
  this.searchedCity = searchedCity;
  this.formatted_query = display_name;
  this.latitude = parseFloat(lat); //<<--used parseFloat because the info was a string and this will change to numbers
  this.longitude = parseFloat(lon);
}

