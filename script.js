const apiKey = 'd96bd23c201ec17519c83c45a36d8b2a';

// Reference to DOM elements
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("city-input");
const searchHistory = document.getElementById("search-history");

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
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

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