const form = document.querySelector("#weather-form");
const cityField = document.querySelector("#city");
const statusMessage = document.querySelector("#status");
const cityResults = document.querySelector("#city-results");
const weatherTable = document.querySelector("#weather-table");
const weatherCity = document.querySelector("#weather-city");
const temperature = document.querySelector("#temperature");
const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");
let latestRequest = 0;

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const search = ++latestRequest;
    const city = cityField.value.trim();
    cityResults.replaceChildren();
    weatherTable.hidden = true;

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
    weatherTable.hidden = true;
    statusMessage.textContent = `Chargement de la météo pour ${label}…`;
    try {
        const data = await fetchWeather(place.latitude, place.longitude);
        if (request === latestRequest) {
            weatherCity.textContent = `Météo actuelle — ${label}`;
            temperature.textContent = formatMeasure(data, "temperature_2m");
            humidity.textContent = formatMeasure(data, "relative_humidity_2m");
            wind.textContent = formatMeasure(data, "wind_speed_10m");
            weatherTable.hidden = false;
            statusMessage.textContent = "";
        }
    } catch {
        if (request === latestRequest) {
            statusMessage.textContent = `Impossible de récupérer la météo pour ${label}.`;
        }
    }
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
        current: "temperature_2m,relative_humidity_2m,wind_speed_10m"
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
