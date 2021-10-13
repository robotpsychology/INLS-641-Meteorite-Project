// const width = 960;
// const height = 500;

let globePanel = document.querySelector('.globe_panel')
let width = globePanel.offsetWidth;
let height = globePanel.offsetHeight;
console.log(width, height)

const config = {
    speed: 0.005,
    verticalTilt: -30,
    horizontalTilt: 0,
};

let locations = [];

const svg = d3.select("#meteorite_globe_vis").attr("width", width).attr("height", height);
const markerGroup = svg.append("g");
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width / 2, height / 2];
let files = [
    "/../data/world-110m.json",
    "/../data/nasa_location_example.json",
];
let promises = [];

// run in div
function globeRender() {
    createPromises(files, promises);
    drawGlobe();
    drawGraticule();
    enableRotation();
}

function createPromises(files, promises) {
    files.forEach(function (url) {
        promises.push(d3.json(url));
    });
    Promise.all(promises).then(function (values) {
        console.log(values);
    });
}

function drawGlobe() {
    Promise.all(promises).then((response) => {
        console.log(response);
        worldData = response[0];
        locationData = response[1];
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
        .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
        .attr("cy", (d) => projection([d.longitude, d.latitude])[1])
        .attr("fill", (d) => {
            const coordinate = [d.longitude, d.latitude];
            gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? "none" : "steelblue";
        })
        .attr("r", 7);

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}