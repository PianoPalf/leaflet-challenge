// Create Array to store the created eqMarkers
let eqMarkers = [];

// Defines markerSize() function that will give each Earthquake Marker a different radius based Magnitude.
function markerSize(magnitude) {
    return (magnitude ** 3) * 2000;
};

// Defines markerColor() function that gives each Earthquake Marker a different color based on Depth.
function markerColor(depth) {
        colors = ['#e7e34e','#eabd3b','#ee9a3a','#ef7e32','#de542c','#c02323','#820401'];
        //colors = ['#29af7f','#1f968b','#287d8e','#33638d','#404788','#482677','#440154'];
        //colors = ['#f0a58f','#ea7369','#eb548c','#db4cb2','#af4bce','#7d3ac1','#29066b'];
        let depthColor = '';
        if (depth > 150) {
            depthColor = colors[6];
        }
        else if (depth >= 110 && depth <= 150) {
            depthColor = colors[5]
        }
        else if (depth >= 80 && depth <= 109) {
            depthColor = colors[4]
        }
        else if (depth >= 50 && depth <= 79) {
            depthColor = colors[3]
        }
        else if (depth >= 30 && depth <= 49) {
            depthColor = colors[2]
        }
        else if (depth >= 10 && depth <= 29) {
            depthColor = colors[1]
        }
        else {
            depthColor = colors[0]
        }
        return depthColor
};
    
// URL for Earthquake and Tectonic Plates GeoJSON Data
let eqURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

////////// FETCH JSON DATA & PLOT LEAFLET MAP /////////
//////////////////////////////////////////////////////////////

// Fetch Earthquake Data
d3.json(eqURL).then(function (data) {
    let features = data.features;
    console.log("Data: ", features[0]);

    // Create Features Object for Easy Access 
    let features_object = features.map(feature => ({
        'id': feature.id,
        'latitude': feature.geometry.coordinates[1],
        'longitude': feature.geometry.coordinates[0],
        'coordinates': [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
        'depth': feature.geometry.coordinates[2],
        'magnitude': feature.properties.mag,
        'place': feature.properties.place,
        'title': feature.properties.title,
        'time': feature.properties.time
    }));

    // Loop through Earthquake Object and create Marker for each Earthquake Object.
    for (let i = 0; i < features_object.length; i++) {
        eqMarkers.push(
            L.circle(features_object[i].coordinates, {
                fillOpacity: 0.75,
                color: "white",
                fillColor: markerColor(features_object[i].depth),
                radius: markerSize(features_object[i].magnitude)
                }).bindPopup(`<h2>${features_object[i].place}</h2> <hr>\
                <body><b>Magnitude:</b> ${features_object[i].magnitude}</body><br>\
                <body><b>Depth:</b> ${features_object[i].depth}</body><br>\
                <body><b>Time:</b> ${new Date(features_object[i].time)}</body>`))}

    // Create Base Map Layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors,\
         <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopo\
         Map</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});

    // Create baseMaps Object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Add all eqMarkers to new layer group.
    let eqLayer = L.layerGroup(eqMarkers);
    
    // Fetch Tectonic Plates Data and Create Map Overlay Variable 
    d3.json(platesURL).then(function (plates) {
        let tecPlates = L.geoJSON(plates, {style: {color: '#dfd98b', fillColor: 'none'}});

    // Create Map with Streetmap, Earthquake and Tectonic Plates layers to display on load.
    let myMap = L.map("map", {
        center: [-6.1444, 134.5238],
        zoom: 4,
        layers: [street, eqLayer, tecPlates]
    });
          
    // Create Overlay Object to hold Overlays.
    let overlayMaps = {
        Earthquakes: eqLayer,
        TectonicPlates: tecPlates
    };
    
    // Create a layer control.
    // Pass it baseMaps and overlayMaps.
    // Add layer control to map.
    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);
    
    // Set up Legend.
    let legend = L.control({position: 'bottomright'});
    
    // Create Legend
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            labels = ["-10-10","10-30","30-50","50-70","80-110","110-150",">150"];
            div.innerHTML = "<h2>Earthquake<br>Depth (km)</h2>";
        // Loop through Labels and generate coloured square for each Label
        for (let i = 0; i < labels.length; i++) {
            div.innerHTML += "<li style=\"background-color: " + colors[i] + "\"></li>" + labels[i] + "<ul>" + "</ul>";
        };
        return div;
    };

    // Add Legend to Map
    legend.addTo(myMap);
    
});
});