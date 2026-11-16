const form = document.querySelector("#weather-form");
const cityField = document.querySelector("#city");
const statusMessage = document.querySelector("#status");
const cityResults = document.querySelector("#city-results");
const weatherBulletin = document.querySelector("#weather-bulletin");
const weatherCity = document.querySelector("#weather-city");
const temperature = document.querySelector("#temperature");
const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");
const weatherCondition = document.querySelector("#weather-condition");
const weatherIcon = document.querySelector("#weather-icon");
const themeToggle = document.querySelector("#theme-toggle");
let latestRequest = 0;

themeToggle.addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.textContent = dark ? "Mode clair" : "Mode sombre";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const search = ++latestRequest;
    const city = cityField.value.trim();
    cityResults.replaceChildren();
    weatherBulletin.hidden = true;

    if (!city) {
        statusMessage.textContent = "Saisis un nom de ville.";
        return;
    }

    statusMessage.textContent = "Recherche en cours…";
    try {
        const cities = await findCities(city);
        if (search !== latestRequest) {
            return;
        }

        for (const place of cities) {
            const item = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            const label = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
            button.textContent = label;
            button.addEventListener("click", () => loadWeather(place, label));
            item.append(button);
            cityResults.append(item);
        }
        statusMessage.textContent = cities.length ? "" : "Aucune ville trouvée.";
    } catch {
        if (search === latestRequest) {
            statusMessage.textContent = "La recherche a échoué. Réessaie dans un instant.";
        }
    }
});

async function findCities(city) {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.search = new URLSearchParams({ name: city, count: "5", language: "fr" });
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Le service de recherche ne répond pas.");
    }

    const data = await response.json();
    return (data.results ?? []).slice(0, 5);
}

async function loadWeather(place, label) {
    const request = ++latestRequest;
    weatherBulletin.hidden = true;
    statusMessage.textContent = `Chargement de la météo pour ${label}…`;
    try {
        const data = await fetchWeather(place.latitude, place.longitude);
        if (request === latestRequest) {
            weatherCity.textContent = label;
            temperature.textContent = formatMeasure(data, "temperature_2m");
            humidity.textContent = formatMeasure(data, "relative_humidity_2m");
            wind.textContent = formatMeasure(data, "wind_speed_10m");
            const [condition, icon] = describeWeather(data.current);
            weatherCondition.textContent = condition;
            weatherIcon.textContent = icon;
            weatherIcon.hidden = !icon;
            weatherBulletin.hidden = false;
            statusMessage.textContent = "";
        }
    } catch {
        if (request === latestRequest) {
            statusMessage.textContent = `Impossible de récupérer la météo pour ${label}.`;
        }
    }
}

function describeWeather({weather_code: code, wind_speed_10m: speed, is_day: isDay}) {
    if ([95, 96, 97, 99].includes(code)) return ["Orage", "⛈️"];
    if ([71, 73, 75, 77, 85, 86].includes(code)) return ["Neige", "🌨️"];
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ["Pluie", "🌧️"];
    if ([45, 48].includes(code)) return ["Brouillard", "🌫️"];
    if (speed >= 40) return ["Venteux", "💨"];
    if (code === 2 || code === 3) return ["Nuageux", "☁️"];
    if (code === 0 || code === 1) {
        return isDay === 0 ? ["Nuit claire", "🌙"] : ["Ensoleillé", "☀️"];
    }
    return ["Conditions indisponibles", ""];
}

function formatMeasure(data, field) {
    const value = data.current[field];
    if (!Number.isFinite(value)) {
        return "Indisponible";
    }

    const unit = data.current_units?.[field];
    return unit ? `${value} ${unit}` : String(value);
}

async function fetchWeather(latitude, longitude) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
        latitude,
        longitude,
        wind_speed_unit: "kmh",
        current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day"
    });
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Le service météo ne répond pas.");
    }

    const data = await response.json();
    if (!data.current) {
        throw new Error("Les données météo sont absentes.");
    }
    return data;
}
