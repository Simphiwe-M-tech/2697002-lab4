// Get DOM elements
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// Main function
async function searchCountry(countryName) {
    try {
        if (!countryName.trim()) {
            throw new Error("Please Enter A Country Name.");
        }

        // Reset UI
        errorMessage.classList.add('hidden');
        countryInfo.classList.add('hidden');
        borderingCountries.classList.add('hidden');
        borderingCountries.innerHTML = '';
        countryInfo.innerHTML = '';

        // Show spinner
        loadingSpinner.classList.remove('hidden');


        const response = await fetch(
            `https://restcountries.com/v3.1/name/${countryName}?fullText=true`
        );

        if (!response.ok) {
            throw new Error("Country not found. Please check spelling.");
        }

        const data = await response.json();
        const country = data[0]; // API returns an array

        // Extract fields safely based on API structure
        const countryNameCommon = country.name?.common || "N/A";
        const capital = country.capital ? country.capital[0] : "N/A";
        const population = country.population
            ? country.population.toLocaleString()
            : "N/A";
        const region = country.region || "N/A";
        const flag = country.flags?.svg || "";

        // =========================
        // Display Country Info
        // =========================
        countryInfo.innerHTML = `
            <h2>${countryNameCommon}</h2>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Population:</strong> ${population}</p>
            <p><strong>Region:</strong> ${region}</p>
            <img src="${flag}" alt="${countryNameCommon} flag" width="150">
        `;

        countryInfo.classList.remove('hidden');

        // =========================
        // Fetch Bordering Countries
        // =========================
        if (country.borders && country.borders.length > 0) {

            // Fetch by alpha code as required in Part 5
            const borderPromises = country.borders.map(code =>
                fetch(`https://restcountries.com/v3.1/alpha/${code}`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error("Error fetching bordering countries.");
                        }
                        return res.json();
                    })
            );

            const borderData = await Promise.all(borderPromises);

            borderData.forEach(borderArray => {
                const borderCountry = borderArray[0];

                const borderDiv = document.createElement('div');
                borderDiv.innerHTML = `
                    <p>${borderCountry.name.common}</p>
                    <img src="${borderCountry.flags.svg}" 
                         alt="${borderCountry.name.common} flag" 
                         width="80">
                `;

                borderingCountries.appendChild(borderDiv);
            });

            borderingCountries.classList.remove('hidden');

        } else {
            borderingCountries.innerHTML = "<p>No bordering countries.</p>";
            borderingCountries.classList.remove('hidden');
        }

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// =========================
// Event Listeners
// =========================

// Click button
searchBtn.addEventListener('click', () => {
    searchCountry(countryInput.value);
});

// Press Enter
countryInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchCountry(countryInput.value);
    }
});