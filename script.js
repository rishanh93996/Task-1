document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const weatherContainer = document.getElementById('weather-container');

    // Default city when page loads
    fetchWeather('London');

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                fetchWeather(city);
            }
        }
    });

    function fetchWeather(city) {
        weatherContainer.innerHTML = '<div class="loading">Loading weather data...</div>';
        
        // Fetch current weather
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('City not found');
                }
                return response.json();
            })
            .then(data => {
                displayCurrentWeather(data);
                // Fetch forecast
                return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Forecast not available');
                }
                return response.json();
            })
            .then(data => {
                displayForecast(data);
            })
            .catch(error => {
                weatherContainer.innerHTML = `<div class="error">${error.message}. Please try another city.</div>`;
            });
    }

    function displayCurrentWeather(data) {
        const weather = data.weather[0];
        const main = data.main;
        const wind = data.wind;
        const sys = data.sys;
        const date = new Date(data.dt * 1000);
        
        const weatherHTML = `
            <div class="current-weather">
                <h2>${data.name}, ${sys.country}</h2>
                <p>${date.toLocaleDateString()} • ${weather.main}</p>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <img class="weather-icon" src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}">
                        <p>${weather.description}</p>
                    </div>
                    <div class="temp">${Math.round(main.temp)}°C</div>
                </div>
                <div class="details">
                    <div class="detail-item">
                        <p>Feels Like</p>
                        <p><strong>${Math.round(main.feels_like)}°C</strong></p>
                    </div>
                    <div class="detail-item">
                        <p>Humidity</p>
                        <p><strong>${main.humidity}%</strong></p>
                    </div>
                    <div class="detail-item">
                        <p>Wind</p>
                        <p><strong>${wind.speed} m/s</strong></p>
                    </div>
                    <div class="detail-item">
                        <p>Pressure</p>
                        <p><strong>${main.pressure} hPa</strong></p>
                    </div>
                </div>
            </div>
        `;
        
        weatherContainer.innerHTML = weatherHTML;
    }

    function displayForecast(data) {
        // Group forecast by day (we'll take one reading per day at 12:00)
        const dailyForecast = data.list.filter(item => {
            const date = new Date(item.dt * 1000);
            return date.getHours() === 12;
        }).slice(0, 5); // Get next 5 days
        
        let forecastHTML = '<h3 style="width: 100%; text-align: center; margin-top: 30px;">5-Day Forecast</h3><div class="forecast">';
        
        dailyForecast.forEach(day => {
            const date = new Date(day.dt * 1000);
            const weather = day.weather[0];
            
            forecastHTML += `
                <div class="forecast-card">
                    <p><strong>${date.toLocaleDateString('en-US', { weekday: 'short' })}</strong></p>
                    <p>${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <img class="weather-icon" src="https://openweathermap.org/img/wn/${weather.icon}.png" alt="${weather.description}">
                    <p>${weather.main}</p>
                    <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                        <span>${Math.round(day.main.temp_max)}°</span>
                        <span style="color: #666;">${Math.round(day.main.temp_min)}°</span>
                    </div>
                </div>
            `;
        });
        
        forecastHTML += '</div>';
        weatherContainer.innerHTML += forecastHTML;
    }
});
