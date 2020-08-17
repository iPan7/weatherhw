//Hides elements that will show once the first search goes through.
$(".jumbotron").hide();
$(".forecast-banner").hide();
var forecastdisplay;

//Pulls previous city searches from local storage.
function allStorage() {
    var values = [],
        keys = Object.keys(localStorage),
        i = keys.length;
    while ( i-- ) {
        values.push( localStorage.getItem(keys[i]));
    }
    for (j = 0; j < values.length; j++) {
        $(".prev-list").prepend("<button class='prev-city mt-1'>" + values[j] + "</button>");
    }
}
allStorage();

//Clears all local storage items and previous searches from the page.
$(".clear").on("click", function() {
    localStorage.clear();
    $(".prev-city").remove();
});

//This function collects all the info from the weather APIs to display on the page
$(".search").on("click", function() {
    var subject = $(".subject").val();
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + subject + "&appid=3c34658c8e0e9fdb71064b81293a3704";
    var queryURL2 = "https://api.openweathermap.org/data/2.5/forecast?q=" + subject + "&appid=3c34658c8e0e9fdb71064b81293a3704";
    var lat;
    var lon;
    if (forecastdisplay === true) {
        $(".forecast-day").remove();
        forecastdisplay = false;
    }

//This first ajax request collects current weather data and converts info into what we want to display.
    $.ajax({
        url: queryURL,
        method: "GET",
        statusCode: {
            404: function() {
              return;
            }
          }    
    }).then(function(response){
        console.log(response);
        $(".prev-list").prepend("<button class='prev-city mt-1'>" + subject + "</button>");
        localStorage.setItem(subject, subject);
        $(".jumbotron").show();
        $(".forecast-banner").show();
        var iconcode = response.weather[0].icon;
        var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
        $(".icon").attr('src', iconurl)
        lat = response.coord.lat;
        lon = response.coord.lon;
        $(".cityName").text(response.name );
        var currentTemp = response.main.temp * (9/5) - 459.67;
        $(".temp").text("Temperature: " + currentTemp.toFixed(1) + " °F");
        $(".humidity").text("Humidity: " + response.main.humidity + "%");
        $(".windSpeed").text("Wind Speed: " + response.wind.speed + " MPH");        queryURL = "http://api.openweathermap.org/data/2.5/uvi/forecast?&appid=3c34658c8e0e9fdb71064b81293a3704&lat=" + lat + "&lon=" + lon;
//This is nested ajax request that gets the UV index but uses longitude and latitude from the previous ajax request to do so.
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response){
            let curntUv = response[0].value;

            if (curntUv > 0.01 & curntUv < 3) {
                //color turn green 
                $(".uvIndex").addClass('bg-green');
                $(".uvIndex").text(`${"UV Index: " + curntUv}`);
            } else if (curntUv > 3 & curntUv < 6) {
                // color turns yellow 
                $(".uvIndex").addClass('bg-yellow');
                $(".uvIndex").text(`${"UV Index: " + curntUv}`);
            } else if (curntUv > 6  & curntUv < 8) {
                // color turns orange 
                $(".uvIndex").addClass('bg-orange');
                $(".uvIndex").text(`${"UV Index: " + curntUv}`);
            } else if (curntUv > 8 & curntUv < 11) {
                // color turns red 
                $(".uvIndex").addClass('bg-red');
                $(".uvIndex").text(`${"UV Index: " + curntUv}`);
            } else if (curntUv > 11) {
                // color turns purple 
                $(".uvIndex").addClass('bg-extremePurple');
                $(".uvIndex").text(`${"UV Index: " + curntUv}`);
            }
        })
    })

//This ajax request collects weather data for the next 5 days (specifically it is grabbing the stays from noon, as opposed to every few hours)
    $.ajax({
        url: queryURL2,
        method: "GET"
    }).then(function(response){
        var forecastTimes = response.list;
        for (i = 0; i < forecastTimes.length; i++) {
            if (forecastTimes[i].dt_txt[12] === "2") {
                var forecastdate = forecastTimes[i].dt_txt;
                var forecastdatedisplay = forecastdate.charAt(5) + forecastdate.charAt(6) + "/" + forecastdate.charAt(8) + forecastdate.charAt(9) +
                "/" + forecastdate.charAt(0) + forecastdate.charAt(1) + forecastdate.charAt(2) + forecastdate.charAt(3);
                var forecasticon = forecastTimes[i].weather[0].icon;
                var forecasticonurl = "http://openweathermap.org/img/w/" + forecasticon + ".png";
                var forecastTemp = forecastTimes[i].main.temp * (9/5) - 459.67;
                var forecastHum = forecastTimes[i].main.humidity;
                if (forecastdisplay === false || forecastdisplay === undefined) {
                    $(".forecast-list").append("<div class='my-3 pb-3 col-md-2 col-lg-2 forecast-day'>" +
                    "<h5>" + forecastdatedisplay + "<h5>" +
                    "<img class='ficon' src=" + forecasticonurl + " alt='Weather icon'>" + 
                    "<div>Temp: " + forecastTemp.toFixed(1) + " °F" + 
                    "</div><div>Humidity: " + forecastHum + 
                    "%</div></div></div>");
                } 
            }
        }
        forecastdisplay = true;
    })
});

//This will search the weather stats for the previous city when said city is clicked on.
$(document).on("click", ".prev-city", function() {
    var subject = $(this).text();
    $(".subject").val(subject);
    $(".search").click();
    $(this).remove();
});