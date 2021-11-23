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
let worldData, locationData, yearlessMeteorites;



// Zoom variable to call on the SVG globe
let zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on('zoom', function (event) {
        svg.selectAll('path')
            .attr('transform', event.transform);
        svg.selectAll("circle")
            .attr('transform', event.transform);
    })
    ;

// Drag variable to call on the SVG globe
let drag = d3.drag()
    .on('drag', function (event) {
        projection.rotate([
            event.x,
            event.y,
            0,
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
    createPromises(files, promises);


    Promise.all(promises).then((response) => {
        worldData = response[0];
        locationData = response[1];
        yearlessMeteorites = response[2];

        globeRender();

    });
    drawMarkers();
    drawGraticule();
    svg.call(drag);
    svg.call(zoom);

}

function globeRender() {
    // svg.call(drag);
    // svg.call(zoom);

    let checkbox = yearlessCheckbox();


    if (checkbox == true) {

        drawGlobe(worldData, yearlessMeteorites, checkbox);
        // populateCheckBox(yearlessMeteorites);
    } else {
        drawGlobe(worldData, locationData);
        // populateCheckBox(locationData);

    }
    drawMarkers();


    // svg.call(drag);
    // svg.call(zoom);

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

////////////
// FILTERS
////////////


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
    //     // Basically checks if the value is undefined. Couldn't find another way to filter it out from the Set.
    //     if (this != '[object Window]') {
    //         items += "<option value='" + this + "'>" + this + "</option>";
    //     } 
    // });
    // $("#test").html(items);


    class1.forEach(function (item) {
        filtered_classes[item] = 'example class2'
    })


    // filtered_classes = [class1, class2, class3]
}



function yearlessCheckbox() {
    let checkbox_element = document.getElementById("yearless_meteorites");

    if (checkbox_element.checked) {
        console.log("Checkbox is  checked..");
        return true
    } else {
        console.log("Checkbox is not checked..");
        return false
    }


}


// overall filter check function, calls other check functions depending on each filter.
function filterCheck(datum) {
    return filterYears(datum, document.getElementById("min_year").value, document.getElementById("max_year").value)
        && filterMass(datum, document.getElementById("min_mass").value, document.getElementById("max_mass").value)
}
function filterYears(datum, min_year, max_year) {

    if (Boolean(datum.year) == true) {
        year = parseInt(datum.year.slice(0, 4))
        if (year >= min_year && year <= max_year) {
            return true

        }
    } else if (Boolean(datum.year) == false) {
        // yearless_meteorites.push(datum)
    }

}
function filterMass(datum, min_mass, max_mass) {
    if (datum.mass >= min_mass && datum.mass <= max_mass) { return true; }
}



////////////
// DRAWING
////////////

function drawGlobe(worldData, locationData, yearless_meteorites = false) {
    // locationData is the NASA data. There's a filter for filtering out NaN and 0 values.
    // If both geo-points are NaN or if both geo-points are 0, get outta here. Else console.log the bad ones.
    // Only using the first 50 NASA data points currently

    console.log(locationData);

    if (!yearless_meteorites) {
        filtered_locations = locationData.slice(0, 50000).filter(function (datum) {
            if (!(isNaN(datum.reclat) && isNaN(datum.reclong) || (datum.reclat == 0 && datum.reclong == 0))) {
                if (filterCheck(datum)) { return datum; }
            }
        });
    } else {

        filtered_locations = locationData.filter(function (datum) {
            if (!(isNaN(datum.reclat) && isNaN(datum.reclong) || (datum.reclat == 0 && datum.reclong == 0))) {
                if (filterMass(datum, document.getElementById("min_mass").value, document.getElementById("max_mass").value)) {
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
            return gdistance > 1.57 ? "none" : "steelblue";
        })
        .attr("r", 5)
        .on("mouseover", function (event, d) {

            document.getElementById("meteorite_name").innerHTML = d.name;
            document.getElementById("classification").innerHTML = d.subclasses.class1[0];
            document.getElementById("subclassification").innerHTML = d.subclasses.class2[0];
            document.getElementById("sub-subclassification").innerHTML = d.subclasses.class3[0];
            document.getElementById("found_or_fell").innerHTML = d.fall;
            document.getElementById("mass").innerHTML = d.mass;
            document.getElementById("date").innerHTML = d.year;
            document.getElementById("lat").innerHTML = d.reclat;
            document.getElementById("long").innerHTML = d.reclong;

        })
        .on("mouseout", function (event, d) {
            document.getElementById("meteorite_name").innerHTML = "&nbsp";
            document.getElementById("classification").innerHTML = "&nbsp";
            document.getElementById("subclassification").innerHTML = "&nbsp";
            document.getElementById("sub-subclassification").innerHTML = "&nbsp";
            document.getElementById("found_or_fell").innerHTML = "&nbsp";
            document.getElementById("mass").innerHTML = "&nbsp";
            document.getElementById("date").innerHTML = "&nbsp";
            document.getElementById("lat").innerHTML = "&nbsp";
            document.getElementById("long").innerHTML = "&nbsp";
        });

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}