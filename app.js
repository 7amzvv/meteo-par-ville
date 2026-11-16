const form = document.querySelector("#weather-form");
const cityField = document.querySelector("#city");
const statusMessage = document.querySelector("#status");
const cityResults = document.querySelector("#city-results");
let latestRequest = 0;

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const search = ++latestRequest;
    const city = cityField.value.trim();
    cityResults.replaceChildren();

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
    statusMessage.textContent = `Chargement de la météo pour ${label}…`;
    try {
        await fetchWeather(place.latitude, place.longitude);
        if (request === latestRequest) {
            statusMessage.textContent = `Météo reçue pour ${label}.`;
        }
    } catch {
        if (request === latestRequest) {
            statusMessage.textContent = `Impossible de récupérer la météo pour ${label}.`;
        }
    }
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
