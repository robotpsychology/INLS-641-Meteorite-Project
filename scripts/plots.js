class Plot {
    constructor(svg_elem) {
        this.svg = svg_elem;
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

        this.centuriesPlot = this.svg.append('g')
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

        //cent plot
        this.centuriesPlot.append("rect")
            .attr("class", "centuriesPlot")
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

        // this.yeardensplot.append("text")
        //     .attr("x", this.plotwidth / 2)
        //     .attr("y", 3 * this.plotheight + 2 * this.margin_y + 27)
        //     .attr("dominant-baseline", "hanging")
        //     .attr("text-anchor", "middle")
        //     .text("Centuries");

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

        this.centuriesPlot.append("text")
            .attr("x", -3 * this.plotwidth - this.margin_y)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .text("Number of Meteorites");

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
            .style("font-size", "12");

        this.massyearplot.append("text")
            .attr("id", "max_mass_text")
            .attr("x", this.margin_y / 2 - 50)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .style("font-size", "12");

        //year axes labels
        this.massyearplot.append("text")
            .attr("id", "min_year_text")
            .attr("x", 0)
            .attr("y", this.plotheight + 3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .style("font-size", "12");

        this.massyearplot.append("text")
            .attr("id", "max_year_text")
            .attr("x", this.plotwidth)
            .attr("y", this.plotheight + 3)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", "middle")
            .style("font-size", "12");


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
            .style("fill", default_color)
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
        // Create data for barplot
        let metClassGrouped = d3.group(this.data, d => d.subclasses.class1[0]);
        let currClassifications = Array.from(metClassGrouped.entries());

        function ClassSummary(className, totalMet) {
            this.classifs = className;
            this.total = totalMet;
        }

        let metClass_data = new Array()

        for (let i = 0; i < currClassifications.length; i++) {
            let classifs = currClassifications[i][0];
            let total = currClassifications[i][1].length;
            metClass_data.push(new ClassSummary(classifs, total))
        };

        // Arrange in alphabetical order
        metClass_data.sort(function(x, y){
            return d3.ascending(x.classifs, y.classifs);
        })

        //Get max counts
        let metClass_max = d3.max(metClass_data, function (d) { return d.total; });

        // Linear y scale function for classifications barplot (cb)
        let cby = d3.scaleLinear()
            .domain([0, metClass_max])
            .range([this.plotheight, 0]);

        // Categorical x scale function for classifications barplot
        const cbx = d3.scaleBand()
            .range([0, this.plotwidth])
            .domain(metClass_data.map(d => d.classifs))
            .padding(0.2);

        // x axis
        // reset values - delete all previously appended bottom axes
        if (document.querySelectorAll("#classifications_text").length > 1) {
            let nodeList = document.querySelectorAll("#classifications_text")

            nodeList.forEach(function (node, index) {
                if (index != nodeList.length - 1) {
                    nodeList[index].remove();

                }
            })
        }

        // add current max value
        this.classbarplot.append("g")
            .attr("id", "classifications_text")
            .attr("transform", `translate(0, ${2 * this.plotheight + this.margin_y} )`)
            .call(d3.axisBottom(cbx))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "11")

        // y axis
        this.classbarplot.append("text")
            .attr("x", -2 * this.plotwidth - 3 * this.margin_y / 2 + 25)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .style("font-size", "12")
            .text(0);

        this.classbarplot.append("text")
            .attr("id", "classif_count_max")
            .attr("x", -this.plotwidth - this.margin_y / 2 - 50)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .style("font-size", "12");

        $("#classif_count_max").text(metClass_max);

        // add bars
        this.classbarplot.selectAll("bars")
            .data(metClass_data)
            .attr('class', 'bars')
            .join("rect")
            .attr("x", d => cbx(d.classifs))
            .attr("y", d => this.plotheight + this.margin_y + cby(d.total))
            .attr("width", cbx.bandwidth())
            .attr("height", d => this.plotheight - cby(d.total))
            .attr("fill", default_color)

        cbx.domain(metClass_data.map(d => d.classifs))


        console.log(cbx(metClass_data.classifs))
        console.log(metClass_data)
        console.log(cbx.domain)
    }

    centuriesPlotRender(datum) {
        let centuries = []
        let min_cent = Math.ceil(slider_settings.min_year/100)
        let max_cent = Math.ceil(slider_settings.max_year/100)
        let new_max = 0;
        for(let i = min_cent; i <= max_cent; i++) {
           let century_mets = filtered_locations.filter(function (datum) {
                    if (Math.ceil(datum.year.slice(0,4)/100) == i) { return datum; }
                })
        let century_object = {};
        century_object.century = i;
        century_object.nummeteors = century_mets.length;
        centuries.push(century_object)
        if(century_object.nummeteors > new_max) {
            new_max = century_object.nummeteors;
        }

        }

        //change
     /*   let x_axis = d3.scaleLinear()
            .domain([min_cent, max_cent])
            .range([0, this.plotwidth]);
        //change
        let y_axis = d3.scaleLinear()
            .domain([0, new_max])
            .range([this.plotheight, 0]);
    */
        //Linear scales for mass year scatter plot
        const mycentx = d3.scaleBand()
            .domain(centuries.map(d => d.century))
            .range([0, this.plotwidth])
            .padding(0.2);

        let ystart = 2 * this.plotheight + 2 * this.margin_y;
        let mycenty = d3.scaleLinear()
            .domain([0, new_max])
            .range([this.plotheight, 0]);

        if (document.querySelectorAll("#centuries_text").length > 1) {
            let nodeList2 = document.querySelectorAll("#centuries_text")

            nodeList2.forEach(function (node, index) {
                if (index != nodeList2.length - 1) {
                    nodeList2[index].remove();

                }
            })
        }

        this.centuriesPlot.append("g")
            .attr("id", "centuries_text")
            .attr("transform", `translate(0, ${3 * this.plotheight + 2 * this.margin_y} )`)
            .call(d3.axisBottom(mycentx))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "11");



        this.centuriesPlot.append("text")
            .attr("id", "centuries_text_x")
            .attr("x", -3 * this.plotwidth - 4 * this.margin_y / 2 + 25)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .style("font-size", "12");

        this.centuriesPlot.append("text")
            .attr("id", "centuries_text_max")
            .attr("x", -2 * this.plotwidth - 2 * this.margin_y / 2 - 50)
            .attr("y", -15)
            .attr("dominant-baseline", "hanging")
            .attr("transform", "rotate(270,0,0)")
            .style("font-size", "12");

        $("centuries_text_max").text(new_max);
    }
    
    render() {
        this.massYearPlotRender();
        this.classificationPlotRender();
        this.centuriesPlotRender();
    }

    //Load data and call render
    loadAndPrepare() {
        let thisvis = this;
        thisvis.render()
    }

}

//Produce plots and call load function
function producePlots() {
    const svg = d3.select('#plots_svg')

    let vis = new Plot(svg);
    vis.loadAndPrepare();
}