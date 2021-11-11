class Plot {
    constructor(svg_elem) {
        this.svg = svg_elem;
        this.data = "/data/meteoriteexample.json";
        this.loadAndPrepare();
    }
    render(d) {
        //Fetch Json
        //json = dataFetch();
        let plotwidth = 200;
        let plotheight = 200;
        let margin_x = 30;
        let margin_y = 50;
        let plotspacing = 10;
        //Linear scales for mass year scatter plot
        let myx = d3.scaleLinear()
			.domain([861, 2012])
			.range([0, width]);

		let myy = d3.scaleLinear()
			.domain([0, 60000000])
			.range([height, 0]);
        
        // Add rectangles for each plot
        let plot_groups = this.svg.append('g')
            .data(this.data)
            .attr('transform', 'translate('+margin_x+','+margin_y+')');


        plot_groups.append('rect')
            .attr('class', 'massyearplot')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", plotwidth)
            .attr("height", plotheight)
            .append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "hanging")
                .text("Mass(g) vs. Year");


        //Mass vs. Year Scatter
        plot_groups.append("rect")
            .attr("class", "massdensplot")
            .attr("x", 0)
            .attr("y", plotheight+margin_y)
            .attr("width", plotwidth)
            .attr("height", plotheight)
            .append("text")
                .attr("class", "label")
                .attr("x", -5)
                .attr("y", 70)
                .attr("dominant-baseline", "hanging")
                .text("Mass(g) vs. Year");

        //Mass density plot
        plot_groups.append("rect")
            .attr("class", "yeardensplot")
            .attr("x", 0)
            .attr("y", 2*plotheight+2*margin_y)
            .attr("width", plotwidth)
            .attr("height", plotheight);

        console.group('hi',d);
        let massyearplot = plot_groups.select('massyearplot').data(d, function(d) {return d.id;});
        
        massyearplot.enter().append('circle')
            .attr('class', 'scatterdot')
            .attr("cx", function(d) { return myx(d.year.slice(0, 4)); })
            .attr("cy", function(d) { return myy(d.mass); })
            .attr("r", 1);

        //Add mass vs. year plot label
        
    }
    loadAndPrepare() {
        let thisvis = this;
    
        //Load data from json
        d3.json(this.data).then(function(d) {
            console.log('howdy',d);
            let data = d;
            thisvis.render(d);
            return d;
        });
            
            
    }
}
//dataFetch function to use json
// let json = [];
// async function dataFetch() {
//     let response = await fetch(data);
//     let json = await response.json();
//     console.log('look at me', json[0]['year'])
//     return json;
// }


//Produce plots and call render function

producePlots();
function producePlots() {
    const svg = d3.select('#plots_svg')      
            
    let vis = new Plot(svg);
    vis.loadAndPrepare();
    //vis.render();
} 