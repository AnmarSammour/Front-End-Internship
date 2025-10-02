const cities = [
    { arabicName: "القدس", apiName: "Jerusalem" },
    { arabicName: "رام الله", apiName: "Ramallah" },
    { arabicName: "نابلس", apiName: "Nablus" },
    { arabicName: "طبريا", apiName: "Tiberias" }
];

const citiesSelect = document.getElementById("cities-select");
const cityNameElement = document.getElementById("city-name");
const dateElement = document.getElementById("date");
const fajrTimeElement = document.getElementById("fajr-time");
const sunriseTimeElement = document.getElementById("sunrise-time");
const dhuhrTimeElement = document.getElementById("dhuhr-time");
const asrTimeElement = document.getElementById("asr-time");
const maghribTimeElement = document.getElementById("maghrib-time");
const ishaTimeElement = document.getElementById("isha-time");

cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city.apiName;
    option.textContent = city.arabicName;
    citiesSelect.appendChild(option);
});

citiesSelect.addEventListener("change", function() {
    const selectedCityApiName = this.value;
    const selectedCity = cities.find(city => city.apiName === selectedCityApiName);
    
    if (selectedCity) {
        cityNameElement.textContent = selectedCity.arabicName;
        getPrayerTimes(selectedCity.apiName);
    }
});

function getPrayerTimes(cityName) {
    const url = `https://api.aladhan.com/v1/timingsByCity`;
    const params = {
        city: cityName,
        country: "PS", 
        method: 5 
    };

    axios.get(url, { params: params } )
        .then(function(response) {
            const timings = response.data.data.timings;
            const date = response.data.data.date.readable;
            const weekday = response.data.data.date.hijri.weekday.ar;
            
            updateTimings(timings);
            dateElement.textContent = `${weekday}, ${date}`;
        })
        .catch(function(error) {
            console.error("API Error:", error);
            alert("حدث خطأ أثناء جلب مواقيت الصلاة. يرجى المحاولة مرة أخرى.");
        });
}

function updateTimings(timings) {
    fajrTimeElement.textContent = timings.Fajr;
    sunriseTimeElement.textContent = timings.Sunrise;
    dhuhrTimeElement.textContent = timings.Dhuhr;
    asrTimeElement.textContent = timings.Asr;
    maghribTimeElement.textContent = timings.Maghrib;
    ishaTimeElement.textContent = timings.Isha;
}

function initialize() {
    const initialCity = cities[0];
    cityNameElement.textContent = initialCity.arabicName;
    citiesSelect.value = initialCity.apiName;
    getPrayerTimes(initialCity.apiName);
}

initialize();
