let plotwidth = 65;
let plotheight = 65;
let margin_x = 20;
let margin_y = 20;

let data = "./data/meteoriteexample.json"


class Plot {
    constructor(svg_elem) {
        this.svg = svg_elem;
    }
    render() {
        //Fetch Json
        json = dataFetch();
        
        //Linear scales
        let myx = d3.scaleLinear()
			.domain([861, 2012])
			.range([0, width]);

		let myy = d3.scaleLinear()
			.domain([0, 60000000])
			.range([height, 0]);
        
        // Add rectangles for each plot

        //Mass vs. Year Scatter
        this.svg.append("rect")
            .attr("class", "massyearplot")
            .attr("x", 18)
            .attr("y", 0)
            .attr("width", plotwidth)
            .attr("height", plotheight)
            .append("text")
                .attr("class", "label")
                .attr("x", -5)
                .attr("y", 70)
                .attr("dominant-baseline", "hanging")
                .text("Mass(g) vs. Year");

        //Mass density plot
        this.svg.append("rect")
            .attr("class", "massdensplot")
            .attr("x", 18)
            .attr("y", plotheight+margin_y)
            .attr("width", plotwidth)
            .attr("height", plotheight);

        // Year Density Plot
        this.svg.append("rect")
            .attr("class", "yeardensplot")
            .attr("x", 18)
            .attr("y", 2*plotheight+2*margin_y)
            .attr("width", plotwidth)
            .attr("height", plotheight);

        // MassYear Scatter Plot data join
        let massyearplot = this.svg.select('massyearplot').data(json, function(d) {return d});
        
        massyearplot.enter().append('circle')
            .attr('class', 'scatterdot')
            .attr("cx", function(d) { return myx(d[0]['year']); })
            .attr("cy", function(d) { return myy(d[0]['mass']); })
            .attr("r", 1);

        //Add mass vs. year plot label
        
    }
}
//dataFetch function to use json
let json = [];
async function dataFetch() {
    let response = await fetch(data);
    let json = await response.json();
    console.log('look at me', json[0]['year'])
    return json;
}

//Produce plots and call render function
producePlots();
function producePlots() {
    const svg = d3.select('#plots_svg')      
            
    let vis = new Plot(svg);
    vis.render();
} 