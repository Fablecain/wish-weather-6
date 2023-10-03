const apiKey = 'd96bd23c201ec17519c83c45a36d8b2a';

// Reference to DOM elements
const searchButton = document.getElementById("search-btn");
const searchInput = document.getElementById("city-input");
const searchHistory = document.getElementById("history-list");

// Event listener for search button click
searchButton.addEventListener("click", () => {
    const cityName = searchInput.value.trim();
    fetchCoordinatesByCity(cityName);
});

/**
 * Fetch the latitude and longitude of a city using the OpenWeather API
 * @param {string} city - The name of the city
 */
function fetchCoordinatesByCity(city) {
    const endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                // If city is found, fetch its weather data
                fetchWeatherData(data.coord.lat, data.coord.lon, city);
            } else {
                alert("City not found. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error fetching coordinates.", error);
        });
}

/**
 * Fill in the HTML with the fetched weather data
 * @param {object} data - The weather data
 * @param {string} city - The name of the city
 */
function updateWeatherData(data, city) {
    // Updating current weather details
    document.getElementById("city-name").innerText = city;
    document.getElementById("current-date").innerText = new Date(data.list[0].dt_txt).toLocaleDateString();
    document.getElementById("current-icon").src = `http://openweathermap.org/img/w/${data.list[0].weather[0].icon}.png`;
    document.getElementById("current-temperature").innerText = data.list[0].main.temp;
    document.getElementById("current-humidity").innerText = data.list[0].main.humidity;
    document.getElementById("current-wind-speed").innerText = data.list[0].wind.speed;

    // Loop through forecast data to update the 5-day forecast cards
    for (let i = 1; i <= 4; i++) {
        const forecastData = data.list[i * 8];  // Fetching data at an estimated 24 hours
        document.getElementById(`day${i + 1}-date`).innerText = new Date(forecastData.dt_txt).toLocaleDateString();
        document.getElementById(`day${i + 1}-icon`).src = `http://openweathermap.org/img/w/${forecastData.weather[0].icon}.png`;
        document.getElementById(`day${i + 1}-temperature`).innerText = forecastData.main.temp;
        document.getElementById(`day${i + 1}-wind-speed`).innerText = forecastData.wind.speed;
        document.getElementById(`day${i + 1}-humidity`).innerText = forecastData.main.humidity;
    }
}

/**
 * Save a searched city to the browser's localStorage
 * @param {string} city - The name of the city
 */
function saveToSearchHistory(city) {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (history.indexOf(city) === -1) {
        history.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(history));
        updateSearchHistory();
    }
}

/**
 * Display search history from localStorage to user
 */
function updateSearchHistory() {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    searchHistory.innerHTML = "";
    history.forEach(city => {
        const listItem = document.createElement("li");
        listItem.innerText = city;
        listItem.addEventListener("click", () => {
            fetchCoordinatesByCity(city);
        });
        searchHistory.appendChild(listItem);
    });
}

// Initialize search history when the page loads
document.addEventListener("DOMContentLoaded", updateSearchHistory);