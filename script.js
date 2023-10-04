const apiKey = "d96bd23c201ec17519c83c45a36d8b2a";

const searchButton = document.getElementById("search-btn");
const searchInput = document.getElementById("city-input");
const searchHistory = document.getElementById("history-list");
const loadingSpinner = document.getElementById("loading-spinner");

searchButton.addEventListener("click", () => {
    const cityName = searchInput.value.trim();
    fetchWeatherByCity(cityName);
});

document.querySelectorAll('.city-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        fetchWeatherByCity(event.target.textContent);
    });
});

function fetchWeatherByCity(city) {
    loadingSpinner.style.display = 'block';
    const endpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            loadingSpinner.style.display = 'none';
            if (data.cod === "200") {
                const aggregatedData = aggregateDailyData(data);
                displayWeatherData(aggregatedData, city);
                saveToSearchHistory(city);
            } else {
                alert("City not found. Please try again.");
            }
        })
        .catch(error => {
            loadingSpinner.style.display = 'none';
            console.error("Error fetching weather data.", error);
        });
}

function aggregateDailyData(data) {
    let aggregatedData = [];
    
    for (let i = 0; i < data.list.length; i += 8) {
        let dailyData = data.list.slice(i, i + 8);

        let avgTemp = 0;
        let avgWindSpeed = 0;
        let avgHumidity = 0;
        let weatherOccurrences = {};

        dailyData.forEach(dataPoint => {
            avgTemp += dataPoint.main.temp;
            avgWindSpeed += dataPoint.wind.speed;
            avgHumidity += dataPoint.main.humidity;
            
            if (!weatherOccurrences[dataPoint.weather[0].main]) {
                weatherOccurrences[dataPoint.weather[0].main] = 1;
            } else {
                weatherOccurrences[dataPoint.weather[0].main]++;
            }
        });

        let commonWeather = Object.keys(weatherOccurrences).reduce((a, b) => weatherOccurrences[a] > weatherOccurrences[b] ? a : b);

        aggregatedData.push({
            date: new Date(dailyData[0].dt_txt).toLocaleDateString(),
            avgTemp: (avgTemp / 8).toFixed(2),
            avgWindSpeed: (avgWindSpeed / 8).toFixed(2),
            avgHumidity: (avgHumidity / 8).toFixed(2),
            commonWeather: commonWeather
        });
    }

    return aggregatedData;
}

function displayWeatherData(aggregatedData, city) {
    // Display the first data as the current weather details
    document.getElementById("city-name-date").innerText = `${city} (${aggregatedData[0].date})`;
    document.getElementById("weather-icon").innerHTML = getFontAwesomeIcon(aggregatedData[0].commonWeather);
    document.getElementById("temperature").innerText = aggregatedData[0].avgTemp + "°F";
    document.getElementById("humidity").innerText = aggregatedData[0].avgHumidity + "%";
    document.getElementById("wind-speed").innerText = aggregatedData[0].avgWindSpeed + " mph";

    // 5-day forecast
    for (let i = 1; i < 6; i++) {
        const forecastData = aggregatedData[i];
        document.getElementById(`day${i}-date`).innerText = forecastData.date;
        document.getElementById(`day${i}-icon`).innerHTML = getFontAwesomeIcon(forecastData.commonWeather);
        document.getElementById(`day${i}-temperature`).innerText = forecastData.avgTemp + "°F";
        document.getElementById(`day${i}-wind-speed`).innerText = forecastData.avgWindSpeed + " mph";
        document.getElementById(`day${i}-humidity`).innerText = forecastData.avgHumidity + "%";
    }
}

function saveToSearchHistory(city) {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (history.indexOf(city) === -1) {
        history.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(history));
        updateSearchHistory();
    }
}

function updateSearchHistory() {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    searchHistory.innerHTML = "";
    history.forEach(city => {
        const listItem = document.createElement("li");
        listItem.innerText = city;
        listItem.classList.add("city-btn"); // Add class for click event
        searchHistory.appendChild(listItem);
    });
}

document.addEventListener("DOMContentLoaded", updateSearchHistory);

function getFontAwesomeIcon(weather) {
    switch (weather) {
        case 'Clear':
            return '<i class="fas fa-sun fa-spin"></i>';
        case 'Clouds':
            return '<i class="fas fa-cloud fa-fade"></i>';
        case 'Rain':
        case 'Drizzle':
            return '<i class="fas fa-cloud-rain fa-beat"></i>';
        case 'Night':
            return '<i class="fas fa-moon fa-bounce"></i>';
        default:
            return '';
    }
}
