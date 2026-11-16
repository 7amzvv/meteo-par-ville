const form = document.querySelector("#weather-form");
const cityField = document.querySelector("#city");
const statusMessage = document.querySelector("#status");
const cityResults = document.querySelector("#city-results");
let latestSearch = 0;

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const search = ++latestSearch;
    const city = cityField.value.trim();
    cityResults.replaceChildren();

    if (!city) {
        statusMessage.textContent = "Saisis un nom de ville.";
        return;
    }

    statusMessage.textContent = "Recherche en cours…";
    try {
        const cities = await findCities(city);
        if (search !== latestSearch) {
            return;
        }

        for (const place of cities) {
            const item = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
            button.addEventListener("click", () => {
                statusMessage.textContent = `${place.name} — Latitude : ${place.latitude} · Longitude : ${place.longitude}`;
            });
            item.append(button);
            cityResults.append(item);
        }
        statusMessage.textContent = cities.length ? "" : "Aucune ville trouvée.";
    } catch {
        if (search === latestSearch) {
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
