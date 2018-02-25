// Store our API endpoint inside queryUrl
var tectonicUrl =  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the tectonic URL
d3.json(tectonicUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  tectonicFeatures(data.features);
});

function tectonicFeatures(tectonicData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>Name: " + feature.properties["Name"] + "<br><hr>" + "<h3>Where: " + feature.geometry.coordinates[0][1] + "," + feature.geometry.coordinates[0][0]).addTo(tectonic1);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var tectonic = L.geoJSON(tectonicData, {
        pointToLayer: function (feature, latlng) {
            return new L.polyline(latlng, {
                color: "green"



            });
        },
        onEachFeature: onEachFeature,

    });
}


var tectonic1 = new L.LayerGroup();


// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";


// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

// Perform a GET request to the tectonic URL
d3.json(tectonicUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  tectonicFeatures(data.features);
});


function getColor(d) {
  return d < 1 ? 'red' :
         d < 2  ? 'orange' :
         d < 3  ? 'yellow' :
         d < 4  ? 'green' :
         d < 5   ? 'blue' :
         d < 6   ? 'purple' :
         d < 7   ? 'gray' :
         d < 8   ? 'brown' :
                  'black';
}

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +
            "</h3><hr><p>Where: " + feature.properties.place + "</p>" +
            "<hr><p>When: " + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return new L.CircleMarker(latlng, {
                radius: feature.properties.mag * 7,
                opacity: feature.properties.mag / 6,
                fillOpacity: feature.properties.mag / 6,
                weight: 1,
                fillColor: getColor(feature.properties.mag),
                color: "gray"



            });
        },
        onEachFeature: onEachFeature,

    });
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}



function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoiampsbGlpbm4xMiIsImEiOiJjamRoazMybXIwYWNmMnlwcnJoYzFpbXQ3In0.wPDhdP-KCkr51SATCpkoLA");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoiampsbGlpbm4xMiIsImEiOiJjamRoazMybXIwYWNmMnlwcnJoYzFpbXQ3In0.wPDhdP-KCkr51SATCpkoLA");

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1IjoiampsbGlpbm4xMiIsImEiOiJjamRoazMybXIwYWNmMnlwcnJoYzFpbXQ3In0.wPDhdP-KCkr51SATCpkoLA");

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Satellite": satellite
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic": tectonic1
        
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });


    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
            labels = [];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        div.innerHTML += "<h4>Magnitude</h4>"

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i]) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(myMap);




}