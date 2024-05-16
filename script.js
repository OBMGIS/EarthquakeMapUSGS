// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Add legend information
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function () {
  var div = L.DomUtil.create('div', 'info legend'),
      grades = [1, 2, 3, 4, 5],
      labels = [];

  // Create a loop to go through the density intervals and generate labels
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  return div;
};

// Create function to set color based on earthquake magnitude
function getColor(c) {
  x = Math.ceil(c);
  switch (Math.ceil(x)) {
    case 1:
      return "#00cc00";
    case 2:
      return "#c7e9b4";
    case 3:
      return "#ccff66";
    case 4:
      return "#ffff66";
    case 5:
      return "#ff6600";
    default:
      return "#ff0000";
  }
}

// Create function to create circular features
function createFeatures(earthquakeData) {
  var earthquakes = L.geoJson(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag * 3,
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup("<h3>Location: " + feature.properties.place +
        "</h3><hr><p>Date/Time: " + new Date(feature.properties.time) + "<br>" +
        "Magnitude: " + feature.properties.mag + "</p>");
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define base layers
  var lightmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var darkmap = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map
  var myMap = L.map("map", {
    center: [26.97, -39.90],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add legend to myMap
  legend.addTo(myMap);
}
