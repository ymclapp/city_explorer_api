'use strict';

require('dotenv').config();


const express = require('express');
const app = express();

// const pg = require('pg');
// const client = require('./client');
const superagent = require('superagent');

const cors = require('cors');

const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(cors());


app.get('/', (request, response) => {
  response.send('You have found the home page! ');
});

// app.get('/location', (request, response) => {
//   const theDataArrayFromTheLocationJson = require('./data/location.json');
//   const theDataOjbFromJson = theDataArrayFromTheLocationJson[0];

//   const searchedCity = request.query.city;

//   const newLocation = new Location (
//     searchedCity,
//     theDataOjbFromJson.display_name,
//     theDataOjbFromJson.lat,
//     theDataOjbFromJson.lon
//   );

//   response.send(newLocation);

// });

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/parks', parksHandler);

function locationHandler(request, response) {  //<<this handler works
  if (!process.env.GEOCODE_API_KEY) throw 'GEO_KEY not found';
  const city = request.query.city;
  const url = 'https://us1.locationiq.com/v1/search.php';
  superagent.get(url)
    .query({
      key: process.env.GEOCODE_API_KEY,
      q: city,
      format: 'json'
    })
    .then(locationResponse => {
      let geoData = locationResponse.body;
      console.log(geoData);
      const location = new Location(city, geoData);
      response.send(location);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

// app.get('/weather', (request, response) => {
//   const weatherData = require('./data/weather.json');
//   const weatherResults = [];  //<<--for returning an array of information
//   weatherData.data.forEach(dailyWeather => {
//     weatherResults.push(new Weather(dailyWeather));
//   });
//   // const weather = new Weather(weatherData);
//   response.send(weatherResults);
// });

function weatherHandler(request, response) {
  const city = request.query.search_query;
  const url = 'https://api.weatherbit.io/v2.0/forecast/daily';

  superagent.get(url)
    .query({
      city: city,
      key: process.env.WEATHER_API_KEY,
      days: 4
    })
    .then(weatherResponse => {
      let weatherData = weatherResponse.body; //this is what comes back from API in json
      console.log(weatherData);

      let dailyResults = weatherData.data.map(dailyWeather => {
        return new Weather(dailyWeather);
      })
      response.send(dailyResults);
    })

    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

function parksHandler(request, response) {
  // const state_code = response.query.state_code;  
  const url = 'https://developer.nps.gov/api/v0/parks';


  superagent.get(url)
    .query({
      // q: 'parks?',
      stateCode: 'ID',//hard coded state code for the moment
      api_key: process.env.PARKS_API_KEY
    })

    .then(parksResponse => {
      let parksData = parksResponse.body; //this is what comes back from API in json
      console.log(parksData);

      let parksResults = parksData.data.map(eachPark => {
        return new Parks (eachPark);
      })
      response.send(parksResults);
    })

    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    });
}

app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

//Has to be after stuff loads too
app.use(notFoundHandler);

//Has to be after stuff loads
app.use(errorHandler);

//client goes here


function errorHandler(error, request, response, next) {
  console.error(error);
  response.status(500).json({
    error: true,
    message: error.message,
  });
}

function notFoundHandler(request, response) {
  response.status(404).json({
    notFound: true,
  });
}


app.listen(PORT,() => console.log(`Listening on port ${PORT}`));

// function Location(searchedCity, display_name, lat, lon) { //<<--this is saying that it needs city and geoData to be able to run the constructor
//   this.searchedCity = searchedCity;
//   this.formatted_query = display_name;
//   this.latitude = parseFloat(lat); //<<--used parseFloat because the info was a string and this will change to numbers
//   this.longitude = parseFloat(lon);
// }

function Location(city, geoData) { //<<--this is saying that it needs city and geoData to be able to run the constructor
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = parseFloat(geoData[0].lat); //<<--used parseFloat because the info was a string and this will change to numbers
  this.longitude = parseFloat(geoData[0].lon);
}

// function Weather(weatherData) {
//   this.forecast = weatherData.weather.description;
//   this.time = weatherData.valid_date;
// }

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = weatherData.datetime;
}

function Parks (parksData) {
  this.parks_url = parksData.url;
  this.name = parksData.fullName;
  this.address = parksData.addresses;
  this.fee = parksData.entranceFees.cost;
  this.description = parksData.description;
}
