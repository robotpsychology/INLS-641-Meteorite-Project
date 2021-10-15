//// VARIABLES

// HTML/SVG/D3 selections and settings
let globePanel = document.querySelector('.globe_panel')
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
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width / 2, height / 2];

// List of files files and initialized lists for accessing them in the function createPromises
let files = [
    "/../data/world-110m.json",
    "/../data/nasa_meteorite_data_Sep_21_2021.json",
];
let locations = [];
let promises = [];


// Zoom variable to call on the SVG globe
let zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', function (event) {
        svg.selectAll('path')
            .attr('transform', event.transform);
        svg.selectAll("circle")
            .attr('transform', event.transform);
    });



//// FUNCTION CALLS
globeRender();



//// FUNCTIONS

// run in div
function globeRender() {
    createPromises(files, promises);
    drawGlobe();
    drawGraticule();
    // enableRotation();
    svg.call(zoom);

}

function createPromises(files, promises) {
    files.forEach(function (url) {
        promises.push(d3.json(url));
    });
}

function drawGlobe() {
    Promise.all(promises).then((response) => {
        console.log(response);
        worldData = response[0];

        // locationData is the NASA data. There's a filter for filtering out NaN and 0 values.
        // If both geo-points are NaN or if both geo-points are 0, get outta here. Else console.log the bad ones.
        // Only using the first 50 NASA data points currently
        locationData = response[1].slice(0, 500).filter(function (datum) {
            if (!(isNaN(datum.reclat) && isNaN(datum.reclong) || (datum.reclat == 0 && datum.reclong == 0))) {
                return datum
            } else {
                console.log(datum)
            }
        });
        console.log(locationData)

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
        locations = locationData;
        drawMarkers();
    });
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

function enableRotation() {
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
    const markers = markerGroup.selectAll("circle").data(locations);
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
        .attr("r", 4);

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}