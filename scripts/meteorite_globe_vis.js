//// VARIABLES

// HTML/SVG/D3 selections and settings
let globePanel = document.getElementById('globe_panel')
let width = globePanel.offsetWidth;
let height = globePanel.offsetHeight;
// const width = 960;
// const height = 500;

const config = {
    speed: 0.005,
    verticalTilt: -30,
    horizontalTilt: 0,
};

const svg = d3.select("#meteorite_globe_vis").attr("width", width).attr("height", height);
const markerGroup = svg.append("g");
// let projection = d3.geoOrthographic();
let projection = d3.geoOrthographic();
let initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width / 2, height / 2];

// List of files files and initialized lists for accessing them in the function createPromises
let files = [
    "/../data/world-110m.json",
    "/../data/nasa_meteorite_data_Oct_31_2021.json",
];
let filtered_locations = [];
let promises = [];
let class1, class2, class3;
let filtered_classes = {}
let yearless_meteorites = []

// Zoom variable to call on the SVG globe
let zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on('zoom', function (event) {
        svg.selectAll('path')
            .attr('transform', event.transform);
        svg.selectAll("circle")
            .attr('transform', event.transform);
        // console.log(event);
        drawMarkers();

    })
    ;

// Drag variable to call on the SVG globe
let drag = d3.drag()
    .on('drag', function (event) {
        // console.log(event)
        projection.rotate([
            event.x,
            event.y,
            0,
        ]);
        svg.selectAll("path").attr("d", path);
        drawMarkers();
    });


//// FUNCTION CALLS
globeRender();



//// FUNCTIONS
function globeRender() {
    createPromises(files, promises);

    Promise.all(promises).then((response) => {
        worldData = response[0];
        locationData = locationDataFiltering(response[1]);
        drawGlobe(response[0], locationData);
        drawMarkers();
        populateCheckBox(locationData);
    });
    drawGraticule();
    // enableRotation();
    svg.call(drag);
    svg.call(zoom);

}


function createPromises(files, promises) {
    files.forEach(function (url) {
        promises.push(d3.json(url));
    });
}

function resetGlobe() {
    svg.selectAll('path')
        .attr('transform', { k: 1, x: 0, y: 0 });
    svg.selectAll("circle")
        .attr('transform', { k: 1, x: 0, y: 0 });

}


function locationDataFiltering(locationData) {
    let slider_settings = {
        "min_year": 1800,
        "max_year": 1900,
        "min_mass": 1000,
        "max_mass": 500000
    }

    locationData = locationData.slice(0, 50000).filter(function (datum) {
        if (!(isNaN(datum.reclat) && isNaN(datum.reclong) || (datum.reclat == 0 && datum.reclong == 0))) {
            if (Boolean(datum.year) == true) {
                datum.year = parseInt(datum.year.slice(0, 4))
                if (datum.year >= slider_settings.min_year && datum.year <= slider_settings.max_year && datum.mass >= slider_settings.min_mass && datum.mass >= slider_settings.max_mass) {
                    return datum

                }
            } else if (Boolean(datum.year) == false) {
                yearless_meteorites.push(datum)
            }



        } else {
            // console.log(datum)
        }
    });

    return locationData
}

function populateCheckBox() {
    class1 = [...new Set(filtered_locations.map(item => item.subclasses.class1[0]))];

    // Can't get this to filter properly like class1 does.
    class2 = [...new Set(filtered_locations.map(function (item) {
        if (item.subclasses.class2) {
            // console.log(item.subclasses.class2[0])
        }
    }))];

    class3 = [...new Set(filtered_locations.map(function (item) {
        if (item.subclasses.class3) {
            return item.subclasses.class3[0]
        }
    }
    ))];
    // $.each(class2, function () {
    //     // Basicaly checks if the value is undefined. Couldn't find another way to filter it out from the Set.
    //     if (this != '[object Window]') {
    //         items += "<option value='" + this + "'>" + this + "</option>";
    //     } 
    // });
    // $("#test").html(items);


    class1.forEach(function (item) {
        filtered_classes[item] = 'example class2'
    })


    console.log('ey', filtered_classes)
    // filtered_classes = [class1, class2, class3]
}


function drawGlobe(worldData, locationData) {
    // locationData is the NASA data. There's a filter for filtering out NaN and 0 values.
    // If both geo-points are NaN or if both geo-points are 0, get outta here. Else console.log the bad ones.
    // Only using the first 50 NASA data points currently


    svg
        .selectAll(".segment")
        .data(
            topojson.feature(worldData, worldData.objects.countries).features
        )
        .enter()
        .append("path")
        .attr("class", "segment")
        .attr("d", path)
        .style("stroke", "#888")
        .style("stroke-width", "1px")
        .style("fill", (d, i) => "#e5e5e5")
        .style("opacity", ".6");
    filtered_locations = locationData;
}

function drawGraticule() {
    const graticule = d3.geoGraticule().step([10, 10]);

    svg
        .append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .style("fill", "#fff")
        .style("stroke", "#ccc");
}

function enableRotation(condition) {
    d3.timer(function (elapsed) {
        projection.rotate([
            config.speed * elapsed - 120,
            config.verticalTilt,
            config.horizontalTilt,
        ]);
        svg.selectAll("path").attr("d", path);
        drawMarkers();
    });

}

function drawMarkers() {
    const markers = markerGroup.selectAll("circle").data(filtered_locations);
    markers
        .enter()
        .append("circle")
        .merge(markers)
        .attr("cx", (d) => projection([d.reclong, d.reclat])[0])
        .attr("cy", (d) => projection([d.reclong, d.reclat])[1])
        .attr("fill", (d) => {
            const coordinate = [d.reclong, d.reclat];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? "none" : "steelblue";
        })
        .attr("r", 5)
        .on("mouseover", function (event, d) {
            document.getElementById("meteorite_name").innerHTML = "Meteorite Name: " + d.name;
            document.getElementById("found_or_fell").innerHTML = "Found/Fell: " + d.fall;
            document.getElementById("mass").innerHTML = "Mass: " + d.mass;
            document.getElementById("date_found").innerHTML = "Year: " + d.year;
            document.getElementById("lat").innerHTML = "Latitude: " + d.reclat;
            document.getElementById("long").innerHTML = "Longitude: " + d.reclong;
        })
        .on("mouseout", function (event, d) {
            document.getElementById("meteorite_name").innerHTML = "Meteorite Name: ";
            document.getElementById("found_or_fell").innerHTML = "Found/Fell: ";
            document.getElementById("mass").innerHTML = "Mass: ";
            document.getElementById("date_found").innerHTML = "Year: ";
            document.getElementById("lat").innerHTML = "Latitude: ";
            document.getElementById("long").innerHTML = "Longitude: ";
        });

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}