var states = ["darknight", "witching", "night", "pink", "green", "whiteblue", "orangeyellow", "purple", "blackwhite"];
var stateCount = [1, 1, 1];
var imageDirectory = "default/", fileType = "png";
//var day_hour = 7, day_minute = 0, sunset_hour = 18, sunset_minute = 30, night_hour = 20, night_minute = 0;
//var day_time = 700, sunset_time = 1830, night_time = 2000;

var fin_sunrise, fin_sunset, fin_noon;
// Denote the start times for the following backgrounds
var darknight = 0, witching = 300, night = 400, pink, green, whiteblue, orangeyellow, purple, blackwhite = 2300;

var time = 0, lastTime = 0, lastState = 0;
var switchTime = 0;
let geoLocation;
let cachedSunsetSunrise;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function load() { //Runs on load
    updateCity();
    getSunsetSunrise();
    await sleep(1000);
    utcTomtn(cachedSunsetSunrise);
    setTimes();
    changeTime();
    setInterval(update,1000/30);
}

function update(){ //Check what time it is and change image accordingly 
    changeTime();
    if (lastTime != time) {
        lastTime = time;
        if (time >= darknight && time < witching) change(0);
        if (time >= witching && time < night) change(1);
        if (time >= night && time < pink) change(2);
        if (time >= pink && time < green) change(3);
        if (time >= green && time < whiteblue) change(4);
        if (time >= whiteblue && time < orangeyellow) change(5);
        if (time >= orangeyellow && time < purple) change(6);
        if (time >= purple && time < blackwhite) change(7);
        if (time >= blackwhite) change(8);
    }
}

function utcTomtn(utc) {
    const {sunrise, sunset, solar_noon} = utc.results;
    //console.log(sunrise);
    //console.log(sunset);
    //console.log(solar_noon);

    // Sunrise times
    if (parseInt(sunrise.substring(11, 13)) >= 6) {
        risehour = parseInt((sunrise.substring(11, 13) - 6) * 100);
    }
    else {
        diff = 6 - parseInt(sunrise.substring(11, 13));
        risehour = (24 - diff) * 100;
    }
    risemin = parseInt(sunrise.substring(14, 16));

    // Sunset times
    if (parseInt(sunset.substring(11, 13)) >= 6) {
        sethour = parseInt((sunset.substring(11, 13) - 6) * 100);
    }
    else {
        diff = 6 - parseInt(sunset.substring(11, 13));
        sethour = (24 - diff) * 100;
    }
    setmin = parseInt(sunset.substring(14, 16));

    // Local noon times
    if (parseInt(solar_noon.substring(11, 13)) >= 6) {
        noonhour = parseInt((solar_noon.substring(11, 13) - 6) * 100);
    }
    else {
        diff = 6 - parseInt(solar_noon.substring(11, 13));
        noonhour = (24 - diff) * 100;
    }
    noonmin = parseInt(solar_noon.substring(14, 16));
    
    fin_sunrise = risehour + risemin;
    fin_sunset = sethour + setmin;
    fin_noon = noonhour + noonmin;

    console.log("Converted times")
    console.log(fin_sunrise);
    console.log(fin_sunset);
    console.log(fin_noon);
}

function setTimes() {
    pink = fin_sunrise - 100;
    green = fin_sunrise + 100;
    whiteblue = fin_noon;
    orangeyellow = fin_sunset - 100;
    purple = fin_sunset + 100;
}

function changeTime() { //Change the current time
	var curTime = new Date();
	time = (curTime.getHours() * 100) + curTime.getMinutes();
}


function change(index) { //Change the image according to the index provided
	if (index != lastState) {
		lastState = index;
	}
    var image = document.getElementById('background');
    image.src = imageDirectory + states[index] + "." + fileType;
    image.alt = "Could not load '" + imageDirectory + states[index] + "." + fileType + "'" + time + " " + switchTime;
}

async function get(api, n = 10, wait = 1000) {
    console.log("Get utc times");
    try {
        const response = await fetch(api);
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();
    } catch (e) {
        if (n === 1) {
            throw new Error(`Failed to GET from ${api}`);
        }
        setTimeout(async () => {
            return await get(api, n - 1, wait * 2);
        }, wait)
    }
}


function updateCity() {
    try {
        //const data = await get(`https://nominatim.openstreetmap.org/search/${city}?format=json&addressdetails=1`);
        console.log("City found");
        geoLocation = { lat: 45.68404, lon: -111.05202, city: "Bozeman", country: "United States of America", state: "Montana" };
        cachedSunsetSunrise = null;
        console.log(geoLocation);
        return;
    } catch (e) {
        console.log("Couldn't find city");
    }
}

async function getSunsetSunrise() {
    const data = await get(`https://api.sunrise-sunset.org/json?lat=${geoLocation.lat}&lng=${geoLocation.lon}&date=today&formatted=0`);
    console.log(data);
    if (!data.results) {
        throw new Error('No sunrise sunset data');
    }
    cachedSunsetSunrise = data;
}

window.wallpaperPropertyListener = { //Wallpaper engine properties
    applyUserProperties: function(properties) {

        if (properties.customimage) { //Setting the directory location if specified
            if (properties.customimage.value) {
                imageDirectory = 'file:///' + properties.customimage.value + '/';
			} else {
			imageDirectory = 'default/';
			}
        }
        if (properties.file_type) {
            if (properties.file_type.value !== "") {
                fileType = properties.file_type.value;
            }
        }
        if (properties.day_hour) {
            if (properties.day_hour.value !== "") {
                day_hour = properties.day_hour.value;
			}
        }
		if (properties.day_minute) {
			if (properties.day_minute.value !== "") {
				day_minute = properties.day_minute.value;
			}
		}
		if (properties.sunset_hour) {
			if (properties.sunset_hour.value !== "") {
                sunset_hour = properties.sunset_hour.value;
			}
        }
		if (properties.sunset_minute) {
			if (properties.sunset_minute.value !== "") {
				sunset_minute = properties.sunset_minute.value;
			}
		}
		if (properties.night_hour) {
			if (properties.night_hour.value !== "") {
                night_hour = properties.night_hour.value;
			}
        }
		if (properties.night_minute) {
			if (properties.night_minute.value !== "") {
				night_minute = properties.night_minute.value;
			}
        }
    }
};
