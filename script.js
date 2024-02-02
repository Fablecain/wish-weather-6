document.addEventListener('DOMContentLoaded', () => {
    updateSearchHistory();
    document.getElementById("search-btn").addEventListener("click", function() {
        const cityName = document.getElementById("city-input").value.trim();
        if (cityName) {
            fetchWeatherByCity(cityName);
        }
    });
});

// Fetch weather data for a city
function fetchWeatherByCity(city) {
    const apiKey = "d96bd23c201ec17519c83c45a36d8b2a";
    const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

    fetch(endpoint)
        .then(response => {
            if (!response.ok) throw new Error('City not found');
            return response.json();
        })
        .then(data => {
            console.log(data); // This line logs the fetched data to the console
            displayWeatherData(data, city);
            saveToSearchHistory(city);
        })
        .catch(error => {
            document.getElementById('error-message').textContent = error.message;
            document.getElementById('error-message').style.display = 'block';
        });
}

// New function to fetch weather by coordinates
function fetchWeatherByCoordinates(lat, lon) {
    const apiKey = "d96bd23c201ec17519c83c45a36d8b2a";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const city = data.city.name;
            displayWeatherData(data, city);
            saveToSearchHistory(city);
        })
        .catch(error => console.error("Error fetching weather data by coordinates: ", error));
}

// Display weather data
function displayWeatherData(data, city) {
    const currentWeather = data.list[0];
    document.getElementById('city-name-date').innerText = `${city} (${new Date(currentWeather.dt * 1000).toLocaleDateString()})`;

    // Use the API values directly without appending units
    document.getElementById('temperature').innerText = currentWeather.main.temp; // API provides this value with units
    document.getElementById('humidity').innerText = currentWeather.main.humidity; // API provides this value with units
    document.getElementById('wind-speed').innerText = currentWeather.wind.speed; // API provides this value with units

    updateForecast(data.list);
}

// Update 5-day forecast dynamically
function updateForecast(forecastData) {
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = ''; // Clear previous forecast

    // Process and display forecast for the next 5 days
    forecastData.filter((item, index) => index % 8 === 0).forEach((day, index) => {
        if (index < 5) { // Limit to 5 days
            const date = new Date(day.dt * 1000).toLocaleDateString();
            const iconClass = getWeatherIconClass(day.weather[0].main);
            const temp = day.main.temp;
            const windSpeed = day.wind.speed;
            const humidity = day.main.humidity;

            const cardHtml = `
                <div class="forecast-card">
                    <h3>${date}</h3>
                    <i class="${iconClass}"></i>
                    <p><strong>Temperature:</strong> ${temp}°F</p>
                    <p><strong>Wind Speed:</strong> ${windSpeed} mph</p>
                    <p><strong>Humidity:</strong> ${humidity}%</p>
                </div>
            `;
            forecastContainer.innerHTML += cardHtml;
        }
    });
}

// Determine the class for weather icons based on the weather condition
function getWeatherIconClass(weather) {
    switch (weather) {
        case 'Clear': return 'fas fa-sun';
        case 'Clouds': return 'fas fa-cloud';
        case 'Rain': return 'fas fa-cloud-rain';
        case 'Snow': return 'fas fa-snowflake';
        case 'Drizzle': return 'fas fa-cloud-rain';
        case 'Thunderstorm': return 'fas fa-bolt';
        default: return 'fas fa-smog';
    }
}

// Save search history to localStorage
function saveToSearchHistory(city) {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(history));
    }
    updateSearchHistory();
}

// Update search history in the UI
function updateSearchHistory() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = ""; // Clear existing history
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];

    history.forEach(city => {
        const listItem = document.createElement("li");
        listItem.textContent = city;
        listItem.addEventListener("click", () => fetchWeatherByCity(city));
        historyList.appendChild(listItem);
    });
}
