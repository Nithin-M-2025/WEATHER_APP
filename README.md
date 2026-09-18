# Weather App

A simple and responsive Weather Application built with React.js that allows users to search for cities and view current weather conditions along with a multi-day forecast.

## Features

* Search weather by city name
* City autocomplete suggestions using a Trie data structure
* Current temperature and "feels like" temperature
* Humidity, wind speed, atmospheric pressure, and UV index
* Multi-day weather forecast
* Weather condition descriptions
* Loading indicators using `react-spinners`
* Error handling for invalid or unavailable locations
* Support for common city aliases such as Bombay → Mumbai and Cochin → Kochi

## Tech Stack

* React.js
* JavaScript
* CSS
* Open-Meteo API
* Trie Data Structure
* react-spinners

## How It Works

1. User enters a city name.
2. The Trie provides matching city suggestions.
3. The selected city is sent to the Open-Meteo Geocoding API.
4. The location's latitude and longitude are obtained.
5. These coordinates are used to fetch weather information from the Open-Meteo Forecast API.
6. The application displays current weather and the upcoming forecast.

## Project Structure

```text
src/
├── App.jsx
├── Trie.js
├── App.css
└── main.jsx
```

## Getting Started

```bash
npm install
npm run dev
```

Then open the local development URL shown by Vite.

## APIs

Weather data is provided by Open-Meteo, which offers weather and geocoding APIs without requiring an API key.
