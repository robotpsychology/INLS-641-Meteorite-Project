////////////
// GLOBAL VARIABLES & SETTINGS
////////////

///// D3 Settings

let globePanel = document.getElementById('globe_panel')
let width = globePanel.offsetWidth;
let height = globePanel.offsetHeight;

const config = {
    speed: 0.005,
    verticalTilt: -30,
    horizontalTilt: 0,
};

const svg = d3.select("#meteorite_globe_vis").attr("width", width).attr("height", height);
const markerGroup = svg.append("g").attr("class", "g-circles");
// let projection = d3.geoOrthographic();
let projection = d3.geoOrthographic();
let initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width / 2, height / 2];

let default_color = "steelblue";


///// Utility and Filterings Variables

let files = [
    "/../data/world-110m.json",
    "/../data/nasa_meteorite_data_Nov_18_2021.json",
    "/../data/nasa_yearless_meteorites_Nov_18_2021.json"
];
let filtered_locations = [];
let promises = [];
let class1, class2, class3;
let filtered_classes = {};
let slider_settings = {};
let worldData, locationData, yearlessMeteorites, sampledLocationData;


let speed = true;


// Zoom variable to call on the SVG globe
let zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on('zoom', function (event) {
        svg.selectAll('path')
            .attr('transform', event.transform);


        if (event.transform.k > 6) {
            svg.selectAll("circle")
                .attr('transform', event.transform)
                .attr("r", 1);
        } else if (event.transform.k > 3.5) {
            svg.selectAll("circle")
                .attr('transform', event.transform)
                .attr("r", 2);
        }
        else {
            svg.selectAll("circle")
                .attr('transform', event.transform)
                .attr("r", 3.5);
        }


    });

// Drag variable to call on the SVG globe
let drag = d3.drag()
    .on('drag', function (event) {

        projection.rotate([
            event.x / 2.5,
            event.y / 2.5,
            0
        ]);
        svg.selectAll("path").attr("d", path);
        drawMarkers();
    });


////////////
// FUNCTION CALLS
////////////
initialRender();



////////////
// UTILITIES
////////////
function initialRender() {
    dataOptimization();
    createPromises(files, promises);


    Promise.all(promises).then((response) => {
        worldData = response[0];
        locationData = response[1];
        // sampledLocationData = _.sample(response[1], 8000)
        sampledLocationData = response[1].filter(function (value, index, arr) {
            return index % 5 == 0;
        })
        yearlessMeteorites = response[2];


        globeRender();
        producePlots();

    });
    drawMarkers();
    drawGraticule();
    svg.call(drag);
    svg.call(zoom);





}

function globeRender(speed = true) {
    let checkbox = yearlessCheckbox();
    if (checkbox == true) {
        drawGlobe(worldData, yearlessMeteorites, checkbox);

    } else {
        if (speed == true) {
            drawGlobe(worldData, sampledLocationData);


        }
        else {
            drawGlobe(worldData, locationData);
        }

    }

    drawMarkers();
    producePlots();
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

function dataOptimization() {
    let speed = document.getElementById("speed")
    let all_data = document.getElementById("all_data")

    speed.addEventListener("click", function () {
        if (speed.checked) {
            speed = true;

        }
        globeRender(true)
    })

    all_data.addEventListener("click", function () {
        if (all_data.checked) {
            speed = false
        }
        globeRender(false);
    })


}

////////////
// FILTERS
////////////


function populateCheckBox() {
    class1 = [...new Set(filtered_locations.map(slider_settings.classifications))];
    /*
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
        //     // Basically checks if the value is undefined. Couldn't find another way to filter it out from the Set.
        //     if (this != '[object Window]') {
        //         items += "<option value='" + this + "'>" + this + "</option>";
        //     } 
        // });
        // $("#test").html(items);
    */

    class1.forEach(function (item) {
        filtered_classes[item] = 'example class2'
    })


    // filtered_classes = [class1, class2, class3]
}


function yearlessCheckbox() {
    dataOptimization();
    let yearless_checkbox = document.getElementById("yearless_meteorites");

    if (yearless_checkbox.checked) {
        return true
    } else {
        return false
    }

}


// overall filter check function, calls other check functions depending on each filter.
function filterCheck(datum, slider_settings) {
    return filterYears(datum, slider_settings.min_year, slider_settings.max_year)
        && filterMass(datum, slider_settings.min_mass, slider_settings.max_mass)
        && filterClass(datum, slider_settings.classifications)
        && filterLatitude(datum, slider_settings.min_latitude, slider_settings.max_latitude)
        && filterLongitude(datum, slider_settings.min_longitude, slider_settings.max_longitude)
        && filterFall(datum, slider_settings.fall)
}

function yearlessFilterCheck(datum, slider_settings) {
    return filterMass(datum, slider_settings.min_mass, slider_settings.max_mass)
        && filterClass(datum, slider_settings.classifications)
        && filterLatitude(datum, slider_settings.min_latitude, slider_settings.max_latitude)
        && filterLongitude(datum, slider_settings.min_longitude, slider_settings.max_longitude)
        && filterFall(datum, slider_settings.fall)
}

function filterYears(datum, min_year, max_year) {
    if (Boolean(datum.year) == true) {
        year = parseInt(datum.year.slice(0, 4))
        if (year >= min_year && year <= max_year) { return true }
    } else if (Boolean(datum.year) == false) {
        // yearless_meteorites.push(datum)
    }
}
function filterMass(datum, min_mass, max_mass) {
    if (datum.mass >= min_mass && datum.mass <= max_mass) { return true; }
}
function filterClass(datum, classifications) {
    if (classifications.indexOf(datum.subclasses.class1[0]) != -1) { return true; }
}
function filterLatitude(datum, min_lat, max_lat) {
    if (datum.geolocation.latitude >= min_lat && datum.geolocation.latitude <= max_lat) {
        return true;
    }
}
function filterLongitude(datum, min_long, max_long) {
    if (datum.geolocation.longitude >= min_long && datum.geolocation.longitude <= max_long) {
        return true;
    }
}
function filterFall(datum, classifier) {
    if (classifier.indexOf(datum.fall) != -1) { return true; }
}



////////////
// INFO PANEL
////////////

function populateInfoPanel(datum) {
    document.getElementById("meteorite_name").innerHTML = datum.name;
    document.getElementById("classification").innerHTML = datum.subclasses.class1[0];
    document.getElementById("found_or_fell").innerHTML = datum.fall;
    document.getElementById("mass").innerHTML = datum.mass ? datum.mass : 'none';
    document.getElementById("date").innerHTML = datum.year ? datum.year.slice(0, 10) : 'unknown';
    document.getElementById("lat").innerHTML = datum.reclat;
    document.getElementById("long").innerHTML = datum.reclong;
}


////////////
// DRAWING
////////////

function drawGlobe(worldData, locations, yearless_meteorites = false) {
    // locationData is the NASA data. There's a filter for filtering out NaN and 0 values.
    // If both geo-points are NaN or if both geo-points are 0, get outta here. Else console.log the bad ones.
    // Only using the first 50 NASA data points currently
    slider_settings = getFilterInfo();


    if (yearless_meteorites == false) {
        filtered_locations = locations.filter(function (datum) {
            if (!(isNaN(datum.reclat) && isNaN(datum.reclong) || (datum.reclat == 0 && datum.reclong == 0))) {
                if (filterCheck(datum, slider_settings)) { return datum; }
            }
        });
    }

    else {

        filtered_locations = locations.filter(function (datum) {
            if (!(isNaN(datum.reclat) && isNaN(datum.reclong) || (datum.reclat == 0 && datum.reclong == 0))) {
                if (yearlessFilterCheck(datum, slider_settings)) {
                    return datum

                }

            }
        });


    }


    svg
        .selectAll(".segment")
        .data(
            topojson.feature(worldData, worldData.objects.countries).features
        )
        .join("path")
        .attr("class", "segment")
        .attr("d", path)
        .style("stroke", "#888")
        .style("stroke-width", "1px")
        .style("fill", (d, i) => "#e5e5e5")
        .style("opacity", ".6");
    // filtered_locations = locationData;
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
    markers = markerGroup.selectAll("circle").data(filtered_locations);
    markers
        .join("circle")
        .attr("cx", (d) => projection([d.reclong, d.reclat])[0])
        .attr("cy", (d) => projection([d.reclong, d.reclat])[1])
        .attr("fill", (d) => {
            const coordinate = [d.reclong, d.reclat];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.85 ? "none" : default_color;
        })
        .attr("r", 3.5)
        .on("mouseover", function (event, datum) {
            this.style.fill = "#DC143C"
            populateInfoPanel(datum);
        })
        .on("mouseleave", function () {

            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", default_color)
        });
    // .on("mouseout", function (event, d) {
    //     document.getElementById("meteorite_name").innerHTML = "&nbsp";
    //     document.getElementById("classification").innerHTML = "&nbsp";
    //     document.getElementById("subclassification").innerHTML = "&nbsp";
    //     document.getElementById("sub-subclassification").innerHTML = "&nbsp";
    //     document.getElementById("found_or_fell").innerHTML = "&nbsp";
    //     document.getElementById("mass").innerHTML = "&nbsp";
    //     document.getElementById("date").innerHTML = "&nbsp";
    //     document.getElementById("lat").innerHTML = "&nbsp";
    //     document.getElementById("long").innerHTML = "&nbsp";
    // });

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}