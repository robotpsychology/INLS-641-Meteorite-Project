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
        this.svg.append("rect")
            .attr("class", "massyearplot")
            .attr("x", 18)
            .attr("y", 0)
            .attr("width", plotwidth)
            .attr("height", plotheight);

        this.svg.append("rect")
            .attr("class", "massdensplot")
            .attr("x", 18)
            .attr("y", plotheight+margin_y)
            .attr("width", plotwidth)
            .attr("height", plotheight);

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
        
    }
}
let json = [];
async function dataFetch() {
    let response = await fetch(data);
    let json = await response.json();
    console.log('look at me', json[0]['year'])
    return json;
}
producePlots();
function producePlots() {
    const svg = d3.select('#plots_svg')
        //.attr("width", plotwidth + 2*margin_x)
        //.attr("height", plotheight + 2*margin_y)
        
            
    let vis = new Plot(svg);
    //d3.json(data).then(json => {vis.render(json);});
    vis.render();
} 