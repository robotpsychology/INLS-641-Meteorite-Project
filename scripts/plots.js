class Plot {
    constructor(svg_elem) {
        this.svg = svg_elem;
        this.data = "/data/meteoriteexample.json";

        //set plot attributes
        let plotwidth = 250;
        let plotheight = 250;
        let margin_x = 20;
        let margin_y = 50;

        // Add rectangles for each plot
        this.massyearplot = this.svg.append('g')
            .attr('transform', 'translate('+margin_x+','+margin_y+')');

        this.massdensplot = this.svg.append('g')
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
        
        //Mass Dens Scatter
        this.massdensplot.append("rect")
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

        this.massdensplot.append("text")
            .attr("x",plotwidth/2)
            .attr("y",2*plotheight + margin_y+3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .text("Mass");

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

        this.massdensplot.append("text")
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


        // this.loadAndPrepare();

        
    }
    render(data) {
        
        //Check data
        console.log('hi',data);

        //Linear scales for mass year scatter plot
        let myx = d3.scaleLinear()
		 	.domain([Number(document.getElementById("min_year").value), Number(document.getElementById("max_year").value)])
		 	.range([0, this.plotwidth]);

		let myy = d3.scaleLinear()
		 	.domain([Number(document.getElementById("min_mass").value), Number(document.getElementById("max_mass").value)])
		 	.range([this.plotheight, 0]);
        
        //datajoin for massyear plot
        let massyear = this.massyearplot.selectAll('.scatterdot').data(data, function(d) {return d.id;});

        //update
        massyear.enter().append('circle')
            .attr('class', 'scatterdot')
            .attr("cx", function(d) { return myy(Number(d.year.slice(0, 4))); })
            .attr("cy", function(d) { return myx(Number(d.mass)); })
            .attr("r", 2);
        

        
    }

    //Load data and call render
    loadAndPrepare() {
        let thisvis = this;
    
        //Load data from json
        d3.json(this.data).then(function(data) {
            
            thisvis.render(data);
            
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