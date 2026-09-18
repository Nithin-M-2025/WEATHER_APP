import { useState, useEffect, useMemo } from 'react'
import { BeatLoader } from 'react-spinners'
import Trie from './Trie'
import './App.css'

const cityAliases = {
    alleppey: 'Alappuzha',
    bombay: 'Mumbai',
    calcutta: 'Kolkata',
    madras: 'Chennai',
    bangalore: 'Bengaluru',
    cochin: 'Kochi',
    trivandrum: 'Thiruvananthapuram',
}


const knownCities = [
    'Alappuzha', 'Alleppey', 'Ahmedabad', 'Amsterdam', 'Athens', 'Auckland',
    'Bangalore', 'Bengaluru', 'Berlin', 'Bombay', 'Boston', 'Brussels',
    'Cairo', 'Calcutta', 'Chennai', 'Chicago', 'Cochin', 'Copenhagen',
    'Delhi', 'Dubai', 'Dublin', 'Edinburgh', 'Frankfurt', 'Geneva',
    'Hong Kong', 'Hyderabad', 'Istanbul', 'Jaipur', 'Jakarta', 'Kochi',
    'Kolkata', 'Kuala Lumpur', 'Lisbon', 'London', 'Los Angeles', 'Madras',
    'Madrid', 'Manila', 'Melbourne', 'Mexico City', 'Miami', 'Milan',
    'Mumbai', 'Munich', 'Nairobi', 'New Delhi', 'New York', 'Osaka',
    'Oslo', 'Paris', 'Prague', 'Rio de Janeiro', 'Rome', 'San Francisco',
    'Seoul', 'Shanghai', 'Singapore', 'Stockholm', 'Sydney', 'Tokyo',
    'Toronto', 'Trivandrum', 'Vienna', 'Warsaw', 'Zurich',
]

const weatherCodeMap = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
}

const getConditionText = (code) => weatherCodeMap[code] || 'Unknown'

const App = () => {
    const [searchInput, setSearchInput] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [selectedPlace, setSelectedPlace] = useState(null)
    const [weatherData, setWeatherData] = useState(null)
    const [isLoadingWeather, setIsLoadingWeather] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [suggestions, setSuggestions] = useState([])

    const cityTrie = useMemo(() => {
        const trie = new Trie()
        knownCities.forEach((city) => trie.insert(city))
        return trie
    }, [])

    const getWeatherGeography = async (overrideValue) => {
        const rawInput = overrideValue !== undefined ? overrideValue : searchInput

        if (rawInput.trim().length < 2) {
            setErrorMsg('Type at least 2 characters to search.')
            return
        }

        setIsSearching(true)
        setErrorMsg('')
        setWeatherData(null)
        setSuggestions([])
        try {
            const normalizedInput =
                cityAliases[rawInput.trim().toLowerCase()] || rawInput

            const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                normalizedInput
            )}&count=1&language=en&format=json`

            const response = await fetch(apiUrl)
            const responseData = await response.json()

            const topMatch = (responseData.results || [])[0]

            if (!topMatch) {
                setErrorMsg('No matching place found. Try a different spelling.')
                setSelectedPlace(null)
                return
            }

            setSelectedPlace({
                id: topMatch.id,
                name: topMatch.name,
                country: topMatch.country,
                adminRegion: topMatch.admin1,
                latitude: topMatch.latitude,
                longitude: topMatch.longitude,
                timezone: topMatch.timezone,
            })
        } catch (err) {
            console.error('Geocoding fetch failed:', err)
            setErrorMsg('Something went wrong while searching. Try again.')
            setSelectedPlace(null)
        } finally {
            setIsSearching(false)
        }
    }

    const onClickSearch = () => {
        getWeatherGeography()
    }

    const onKeyDownSearchInput = (event) => {
        if (event.key === 'Enter') {
            getWeatherGeography()
        }
    }

    useEffect(() => {
        if (!selectedPlace) return

        const getForecastData = async () => {
            setIsLoadingWeather(true)
            setErrorMsg('')
            try {
                const { latitude, longitude } = selectedPlace
                const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`

                const response = await fetch(apiUrl)
                const responseData = await response.json()

                const current = responseData.current
                const daily = responseData.daily

                const formattedWeather = {
                    temperature: current.temperature_2m,
                    feelsLike: current.apparent_temperature,
                    humidity: current.relative_humidity_2m,
                    windSpeed: current.wind_speed_10m,
                    pressure: current.surface_pressure,
                    isDay: current.is_day,
                    weatherCode: current.weather_code,
                    forecast: daily.time.map((date, index) => ({
                        date,
                        weatherCode: daily.weather_code[index],
                        maxTemp: daily.temperature_2m_max[index],
                        minTemp: daily.temperature_2m_min[index],
                        sunrise: daily.sunrise[index],
                        sunset: daily.sunset[index],
                        uvIndexMax: daily.uv_index_max[index],
                    })),
                }

                setWeatherData(formattedWeather)
            } catch (err) {
                console.error('Forecast fetch failed:', err)
                setErrorMsg('Could not load weather for that place. Try again.')
                setWeatherData(null)
            } finally {
                setIsLoadingWeather(false)
            }
        }

        getForecastData()
    }, [selectedPlace])

    const onChangeSearchInput = (event) => {
        const value = event.target.value
        setSearchInput(value)

        if (value.trim().length < 1) {
            setSuggestions([])
            return
        }

        const matches = cityTrie.getWordsWithPrefix(value.trim())
        setSuggestions(matches)
    }

    const onSelectSuggestion = (city) => {
        setSearchInput(city)
        setSuggestions([])
        getWeatherGeography(city)
    }

    const renderSearchLoader = () => (
        <div className="loading-view-container">
            <BeatLoader color="#4a7bc4" size={10} />
        </div>
    )

    const renderWeatherLoader = () => (
        <div className="loading-view-container">
            <BeatLoader color="#ffffff" size={12} />
        </div>
    )

    const renderCurrentWeather = () => {
        if (!weatherData) return null
        return (
            <div className="currentWeatherCard">
                <p className="cityName">
                    {selectedPlace.name}, {selectedPlace.country}
                </p>
                <p className="bigTemperature">{Math.round(weatherData.temperature)}°C</p>
                <p className="conditionText">
                    Feels like {Math.round(weatherData.feelsLike)}° ·{' '}
                    {getConditionText(weatherData.weatherCode)}
                </p>

                <div className="detailsGrid">
                    <div className="detailTile">
                        <p className="detailLabel">Humidity</p>
                        <p className="detailValue">{weatherData.humidity}%</p>
                    </div>
                    <div className="detailTile">
                        <p className="detailLabel">Wind</p>
                        <p className="detailValue">{weatherData.windSpeed} km/h</p>
                    </div>
                    <div className="detailTile">
                        <p className="detailLabel">Pressure</p>
                        <p className="detailValue">{weatherData.pressure} hPa</p>
                    </div>
                    <div className="detailTile">
                        <p className="detailLabel">UV index</p>
                        <p className="detailValue">{weatherData.forecast[0].uvIndexMax}</p>
                    </div>
                </div>
            </div>
        )
    }

    const renderForecast = () => {
        if (!weatherData) return null
        return (
            <ul className="forecastList">
                {weatherData.forecast.map((day) => (
                    <li key={day.date} className="forecastDay">
                        <p className="forecastDate">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="forecastCondition">{getConditionText(day.weatherCode)}</p>
                        <p className="forecastTemps">
                            {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                        </p>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <div className="main_container">
            <div className="showTemperature">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={onChangeSearchInput}
                    onKeyDown={onKeyDownSearchInput}
                    className="inputElement"
                />
                <button className="btn" type="button" onClick={onClickSearch}>
                    Search
                </button>
            </div>

            {suggestions.length > 0 && (
                <ul className="resultsList">
                    {suggestions.map((city) => (
                        <li
                            key={city}
                            className="resultItem"
                            onClick={() => onSelectSuggestion(city)}
                        >
                            {city}
                        </li>
                    ))}
                </ul>
            )}

            {isSearching && renderSearchLoader()}

            {errorMsg && <p className="errorText">{errorMsg}</p>}

            {isLoadingWeather && renderWeatherLoader()}
            {!isLoadingWeather && renderCurrentWeather()}
            {!isLoadingWeather && renderForecast()}
        </div>
    )
}

export default App