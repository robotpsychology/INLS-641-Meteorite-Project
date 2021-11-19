import {nest} from 'd3-collection';

class Plot {
    constructor(svg_elem) {
        this.svg = svg_elem;
        this.data = "/data/meteoriteexample.json";

        //set plot attributes
        let plotwidth = 200;
        let plotheight = 200;
        let margin_x = 15;
        let margin_y = 50;

        // Add rectangles for each plot
        this.massyearplot = this.svg.append('g')
            .attr('transform', 'translate('+margin_x+','+margin_y+')');

        this.classbarplot = this.svg.append('g')
            .attr('transform', 'translate('+margin_x+','+margin_y+')');

        this.yeardensplot = this.svg.append('g')
            .attr('transform', 'translate('+margin_x+','+margin_y+')');

        //Mass vs. year plot
        this.massyearplot.append('rect')
            .attr('class', 'massyearplot')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", plotwidth)
            .attr("height", plotheight);

        // Classifications bar plot
        this.classbarplot.append("rect")
            .attr("class", "massdensplot")
            .attr("x", 0)
            .attr("y", plotheight+margin_y)
            .attr("width", plotwidth)
            .attr("height", plotheight);

        //Year density plot
        this.yeardensplot.append("rect")
            .attr("class", "yeardensplot")
            .attr("x", 0)
            .attr("y", 2*plotheight+2*margin_y)
            .attr("width", plotwidth)
            .attr("height", plotheight);

        //Add Axes Labels
        // Add the x axis labels.
        this.massyearplot.append("text")
            .attr("x",plotwidth/2)
            .attr("y",plotheight +3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .text("Year");

        this.classbarplot.append("text")
            .attr("x",plotwidth/2)
            .attr("y",2*plotheight + margin_y+3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .text("Meteorite Classification");

        this.yeardensplot.append("text")
            .attr("x",plotwidth/2)
            .attr("y",3*plotheight + 2*margin_y+3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .text("Year");

        // Add y axis labels
        this.massyearplot.append("text")
            .attr("x",-plotwidth/2 - margin_y/2)
            .attr("y",-15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .text("Mass");

        this.classbarplot.append("text")
            .attr("x",-2*plotwidth)
            .attr("y",-15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .text("Num. Meteorites");

        this.yeardensplot.append("text")
            .attr("x",-3*plotwidth - margin_y)
            .attr("y",-15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .text("Num. Meteorites");


        this.loadAndPrepare();
    }
    render(data) {

        //Check data
        console.log('hi',data);

        //Linear scales for mass year scatter plot
        let myx = d3.scaleLinear()
            .domain([861, 2012])
            .range([0, ]);

        let myy = d3.scaleLinear()
            .domain([0, 60000000])
            .range([, 0]);

        //datajoin for massyear plot
        let massyear = this.massyearplot.select(".massyearplot").selectAll('.scatterdot').data(data, function(d) {return d.id;});

        //update
        massyear.enter().append('circle')
            .attr('class', 'scatterdot')
            .attr("cx", function(d) { return myx(d.year.slice(0, 4)); })
            .attr("cy", function(d) { return myy(d.mass); })
            .attr("r", 10);



    }

    renderClassifications(data) {

        d3.nest().key(function(d){
            return d.subclasses.class1; })
            .rollup(function(leaves){
                return d3.sum(leaves, function(d){
                    return 1;
                });
            }).entries(data)
            .map(function(d){
                return { Subclass: d.key, Value: d.values};
            });

        console.log(data);
    }

    //Load data and call render
    loadAndPrepare() {
        let thisvis = this;

        //Load data from json
        d3.json(this.data).then(function(data) {

            thisvis.render(data);
            thisvis.renderClassifications(data);

        });


    }
}


//Produce plots and call load function
producePlots();
function producePlots() {
    const svg = d3.select('#plots_svg')

    let vis = new Plot(svg);
    vis.loadAndPrepare();
} 