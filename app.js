const form = document.querySelector("#weather-form");
const cityField = document.querySelector("#city");
const statusMessage = document.querySelector("#status");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityField.value;
    statusMessage.textContent = `Ville saisie : ${city}`;
});
