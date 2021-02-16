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

app.get('/weather', (request, response) => {
//   const theDataArrayFromTheWeatherJson = require('./data/weather.json');
//   const theDataOjbFromJson = theDataArrayFromTheWeatherJson.data[0];

//   //   const searchedCity = request.query.city;

//   const newWeather = new Weather (
//     // searchedCity,
//     theDataOjbFromJson.weather.description,
//     theDataOjbFromJson.valid_date
//   );

//   response.send(newWeather);

// });

  const weatherData = require('./data/weather.json');
  const weatherResults = [];  //<<--for returning an array of information
  weatherData.data.forEach(dailyWeather => {
    weatherResults.push(new Weather(dailyWeather));
  });
  // const weather = new Weather(weatherData);
  response.send(weatherResults);
});

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

function Location(searchedCity, display_name, lat, lon) { //<<--this is saying that it needs city and geoData to be able to run the constructor
  this.searchedCity = searchedCity;
  this.formatted_query = display_name;
  this.latitude = parseFloat(lat); //<<--used parseFloat because the info was a string and this will change to numbers
  this.longitude = parseFloat(lon);
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = weatherData.valid_date;
}
