const form = document.querySelector("#weather-form");
const cityField = document.querySelector("#city");
const statusMessage = document.querySelector("#status");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityField.value.trim();
    if (!city) {
        statusMessage.textContent = "Saisis un nom de ville.";
        return;
    }
    statusMessage.textContent = `Ville saisie : ${city}`;
});
