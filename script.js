// Get DOM elements
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// Main function
async function searchCountry(countryName) {

    // =========================
    // ALWAYS Reset UI First
    // =========================
    const trimmedName = countryName.trim();
    if(!trimmedName){
      errorMessage.classList.remove('hidden');
        errorMessage.textContent = 'please enter country name';  
        borderingCountries.classList.add('hidden');
    countryInfo.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    return;
    }
    

    try {

       errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
    countryInfo.classList.add('hidden');
    borderingCountries.classList.add('hidden');
    countryInfo.innerHTML = '';
    borderingCountries.innerHTML = '';

        // Show spinner
        loadingSpinner.classList.remove('hidden');

        const response = await fetch(
            `https://restcountries.com/v3.1/name/${trimmedName}?fullText=true`
        );

        if (!response.ok) {
            throw new Error("Country not found. Please check spelling.");
        }

        const data = await response.json();
        const country = data[0];

        const countryNameCommon = country.name?.common || "N/A";
        const capital = country.capital ? country.capital[0] : "N/A";
        const population = country.population
            ? country.population.toLocaleString()
            : "N/A";
        const region = country.region || "N/A";
        const flag = country.flags?.svg || "";

        // Display country info
        countryInfo.innerHTML = `
            <h2>${countryNameCommon}</h2>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Population:</strong> ${population}</p>
            <p><strong>Region:</strong> ${region}</p>
            <img src="${flag}" alt="${countryNameCommon} flag" width="150">
        `;

        countryInfo.classList.remove('hidden');

        // Bordering countries
        if (country.borders && country.borders.length > 0) {

            const borderPromises = country.borders.map(code =>
                fetch(`https://restcountries.com/v3.1/alpha/${code}`)
                    .then(res => res.json())
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