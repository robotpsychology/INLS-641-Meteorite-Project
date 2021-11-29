class Plot {
    constructor(svg_elem) {
        this.svg = svg_elem;
        // this.data = "/data/nasa_meteorite_data_Nov_18_2021.json";
        this.data = filtered_locations;

        //set plot attributes
        this.plotwidth = 250;
        this.plotheight = 250;
        this.margin_x = 20;
        this.margin_y = 50;

        // Add rectangles for each plot
        this.massyearplot = this.svg.append('g')
            .attr('transform', 'translate(' + this.margin_x + ',' + this.margin_y + ')');

        this.classbarplot = this.svg.append('g')
            .attr('transform', 'translate(' + this.margin_x + ',' + this.margin_y + ')');

        this.yeardensplot = this.svg.append('g')
            .attr('transform', 'translate(' + this.margin_x + ',' + this.margin_y + ')');

        //Mass vs. year plot
        this.massyearplot.append('rect')
            .attr('class', 'massyearplot')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.plotwidth)
            .attr("height", this.plotheight);

        //Classifications Bar Plot
        this.classbarplot.append("rect")
            .attr("class", "massdensplot")
            .attr("x", 0)
            .attr("y", this.plotheight + this.margin_y)
            .attr("width", this.plotwidth)
            .attr("height", this.plotheight);

        //Year density plot
        this.yeardensplot.append("rect")
            .attr("class", "yeardensplot")
            .attr("x", 0)
            .attr("y", 2 * this.plotheight + 2 * this.margin_y)
            .attr("width", this.plotwidth)
            .attr("height", this.plotheight);


        //Add Axes Labels
        // Add the x axis labels.
        this.massyearplot.append("text")
            .attr("x", this.plotwidth / 2)
            .attr("y", this.plotheight + 3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .text("Year");

        /*
        this.classbarplot.append("text")
            .attr("x", this.plotwidth / 2)
            .attr("y", 2 * this.plotheight + this.margin_y + 3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .text("Mass(g)");
         */

        this.yeardensplot.append("text")
            .attr("x", this.plotwidth / 2)
            .attr("y", 3 * this.plotheight + 2 * this.margin_y + 3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .text("Year");

        // Add y axis labels
        this.massyearplot.append("text")
            .attr("x", -this.plotwidth / 2 - this.margin_y / 2)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .text("Mass(g)");

        this.classbarplot.append("text")
            .attr("x", -2 * this.plotwidth)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .text("Num. Meteorites");

        this.yeardensplot.append("text")
            .attr("x", -3 * this.plotwidth - this.margin_y)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .text("Num. Meteorites");


        // this.loadAndPrepare();


    }
    massYearPlotRender() {
        //Linear scales for mass year scatter plot
        let myx = d3.scaleLinear()
            .domain([slider_settings.min_year, slider_settings.max_year])
            .range([0, this.plotwidth]);

        let myy = d3.scaleLinear()
            .domain([slider_settings.min_mass, slider_settings.max_mass])
            .range([this.plotheight, 0]);


        //mass axes labels
        this.massyearplot.append("text")
            .attr("id", "min_mass_text")
            .attr("x", -this.plotwidth - this.margin_y / 2 + 25)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .style("font-size", "12")
        // .text(slider_settings.min_mass);

        this.massyearplot.append("text")
            .attr("id", "max_mass_text")
            .attr("x", this.margin_y / 2 - 50)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .style("font-size", "12")
        // .text(slider_settings.max_mass);

        //year axes labels
        this.massyearplot.append("text")
            .attr("id", "min_year_text")
            .attr("x", 0)
            .attr("y", this.plotheight + 3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .style("font-size", "12")
        // .text(slider_settings.min_year);

        this.massyearplot.append("text")
            .attr("id", "max_year_text")
            .attr("x", this.plotwidth)
            .attr("y", this.plotheight + 3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .style("font-size", "12")
        // .text(slider_settings.max_year);



        $("#min_mass_text").text(slider_settings.min_mass);
        $("#max_mass_text").text(slider_settings.max_mass);
        $("#min_year_text").text(slider_settings.min_year);
        $("#max_year_text").text(slider_settings.max_year);



        //datajoin for massyear plot
        let massyear = this.massyearplot.selectAll('.scatterdot').data(this.data, function (d) { return d.id; });

        //add circles
        massyear.exit()
            .attr("r", 0)
            .remove();

        massyear.enter().append('circle')
            .attr('class', 'scatterdot')
            .attr("cx", function (d) {
                if (d.year && Number(d.year.slice(0, 4)) <= slider_settings.max_year) {
                    return myx(Number(d.year.slice(0, 4)));
                }
                else {
                    return -1000;
                }
            })
            .attr("cy", function (d) { return myy(Number(d.mass)); })
            .attr("r", 2)
            .attr("fill", default_color)
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
    }

    classificationPlotRender() {
        // Group by classifications and get counts
        let metClassSums = d3.rollup(this.data,
            function(d_groups) {
                let class1tot  = d_groups.length;

                return {
                    total_class1: class1tot,
                    meteorites: d_groups
                }
            },
            function(d) {
                return d.subclasses.class1[0];
            });

        //Get max counts
        let metClassGrouped = d3.group(this.data, d => d.subclasses.class1[0]);

        let currClassifications = Array.from(metClassGrouped.entries());
        let metClass_max = d3.max(currClassifications,
            function(d) {
                for(let i =  0; i < currClassifications.length; i++) {
                    return currClassifications[i][1].length;
                }
        });

        // Create data for barplot

        function ClassSummary(className, totalMet) {
            this.classifs = className;
            this.total = totalMet;
        }

       let metClass_data = new Array()

        for(let i =  0; i < currClassifications.length; i++) {
            let classifs = currClassifications[i][0];
            let total = currClassifications[i][1].length;
            metClass_data.push(new ClassSummary(classifs, total))
        };

        //Linear scales for mass year scatter plot

        let cby = d3.scaleLinear()
            .domain([0, metClass_max])
            .range([this.plotheight, 0]);

        const cbx = d3.scaleBand()
            .range([ 0, this.plotwidth ])
            .domain(metClass_data.map(d => d.classifs))
            .padding(0.2);

        // x axis
        this.classbarplot.append("g")
            .attr("id", "classifications_text")
            .attr("transform", `translate(0, ${2*this.plotheight + this.margin_y} )`)
            .call(d3.axisBottom(cbx))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end")
                .style("font-size", "11")


        // y axis
        this.classbarplot.append("text")
            .attr("x", -2*this.plotwidth - 3*this.margin_y / 2 + 25)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .style("font-size", "12")
            .text(0);

        this.classbarplot.append("text")
            .attr("id", "classif_count_max")
            .attr("x", -this.plotwidth - this.margin_y/ 2 - 50)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .style("font-size", "12");

        $("#classif_count_max").text(metClass_max);


        //add bars
        this.classbarplot.selectAll("bars")
            .data(metClass_data)
            .attr('class', 'bars')
            .join("rect")
            .attr("x", d => cbx(d.classifs))
            .attr("y", d => this.plotheight + this.margin_y + cby(d.total))
            .attr("width", cbx.bandwidth())
            .attr("height", d => this.plotheight - cby(d.total))
            .attr("fill", "#69b3a2")


        console.log(cbx(metClass_data.classifs))
        console.log(metClass_data)
        //

        /*
        //add circles
        massyear.exit()
            .attr("r", 0)
            .remove();

        massyear.enter().append('rectangle')
            .attr('class', 'bars')
            .attr("cx", function (d) {
                if (d.year && Number(d.year.slice(0, 4)) <= slider_settings.max_year) {
                    return myx(Number(d.year.slice(0, 4)));
                }
                else {
                    return -1000;
                }
            })
            .attr("cy", function (d) { return myy(Number(d.mass)); })
            .attr("r", 2)
            .on("mouseover", function (event, datum) {
                populateInfoPanel(datum);
            })

         */
    }


    render(data) {
        this.massYearPlotRender();
        this.classificationPlotRender();

    }

    //Load data and call render
    loadAndPrepare() {
        let thisvis = this;

        //Load data from json
        // d3.json(this.data).then(function (data) {

        //     thisvis.render(data);

        // });

        thisvis.render(this.data)


    }

}


//Produce plots and call load function
producePlots();
function producePlots() {
    const svg = d3.select('#plots_svg')

    let vis = new Plot(svg);
    vis.loadAndPrepare();
}