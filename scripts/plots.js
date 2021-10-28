let plotwidth = 350;
let plotheight = 350;
let margin_x = 20;
let margin_y = 20;



class Plot {
    constructor(svg_elem) {
        this.svg = svg_elem;
    }
    render() {
         
        // Add a background rectangle
        this.svg.append("rect")
            .attr("class", "plot")
            .attr("x", -320)
            .attr("y", 0)
            .attr("width", plotwidth)
            .attr("height", plotheight);

        this.svg.append("rect")
            .attr("class", "plot")
            .attr("x", -320)
            .attr("y", 500)
            .attr("width", plotwidth)
            .attr("height", plotheight);
    }
}

producePlots();
producePlots();
function producePlots() {
    const svg = d3.select('#plots_svg')
        .attr("width", plotwidth + 2*margin_x)
        .attr("height", plotheight + 2*margin_y);

            
    let vis = new Plot(svg);
    vis.render();
} 