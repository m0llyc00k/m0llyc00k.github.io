/*global d3*/
/*global $ */

//scroll transition
$(document).ready(function() {
    $("a").on('click', function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function() {
                window.location.hash = hash;
            });
        }
    });
});

//set up beeswarm
let height = 850;
let width = 1130;
let margin = ({ top: 20, right: 100, bottom: 40, left: 20 });
let allDates = [];

// Data structure describing chart scales
let Scales = {
    lin: "scaleLinear",
    log: "scaleLog"
};

// Data structure describing volume of displayed data
let Count = {
    dateSort: "dateSort",
};

// Data structure describing legend fields value
let Legend = {
    dateSort: "dateSort",
};

let chartState = {};

chartState.measure = Count.dateSort;
chartState.scale = Scales.lin;
chartState.legend = Legend.dateSort;


// Colors used for circles depending on typeSort
let colors = d3.scaleOrdinal()
    .domain(["buttons", "signs", "posters", "placards", "correspondence", "pamphlets", "fliers", "other"])
    .range(['#d4c874', '#ba8a30', '#db666f', '#5c86aa', '#a53d24', '#76943c', '#66988d', '#ba5f41']);


d3.select("#buttonsColor").style("color", colors("buttons"));
d3.select("#signsColor").style("color", colors("signs"));
d3.select("#postersColor").style("color", colors("posters"));
d3.select("#placardsColor").style("color", colors("placards"));
d3.select("#correspondenceColor").style("color", colors("correspondence"));
d3.select("#pamphletsColor").style("color", colors("pamphlets"));
d3.select("#fliersColor").style("color", colors("fliers"));
d3.select("#otherColor").style("color", colors("other"));


let svg = d3.select("#svgbeeswarm")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

svg.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("text-anchor", "left")
    .style("font-size", "30px")
    .style("fill", "#b9b6af")
    .style("font-family", "Zilla Slab")
    // .style("font-variant", "small-caps")
    // .style("font-weight", 500)
    // .style("font-family", "Zilla Slab Highlight")
    .style("font-weight", 500)
    .text("Political and Activist Ephemera at the Smithsonian");

// Add subtitle to graph
svg.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("text-anchor", "left")
    .style("font-size", "34px")
    .style("fill", "#b9b6af")
    .style("max-width", 400)
    .style("font-family", "Zilla Slab Highlight")
    .style("font-weight", 600)
    .text("Temporary Objects with Permanent Impact");




let xScale = d3.scaleLinear()
    .domain(allDates.map(d => d.dateSort))
    .range([margin.left, width - margin.right])

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")


// Create line that connects circle and X axis
let xLine = svg.append("line")
    .attr("stroke", "rgb(96,125,139)")
    .attr("stroke-dasharray", "3,4")
    .attr("stroke-width", "2");

// Create tooltip div and make it invisible
let tooltip = d3.select("#svgbeeswarm").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


// Load and process data
d3.csv("./beeswarm-data-new-rev_nov20.csv").then(function(data) {

    let dataSet = data;

    redraw();

    // Trigger filter function whenever checkbox is ticked/unticked
    d3.selectAll("input").on("change", filter);

    function redraw() {

        // Set scale type based on button clicked
        if (chartState.scale === Scales.lin) {
            xScale = d3.scaleLinear().range([margin.left, width - margin.right])
        }

        if (chartState.scale === Scales.log) {
            xScale = d3.scaleLog().range([margin.left, width - margin.right]);
        }

        xScale.domain(d3.extent(dataSet, function(d) {
            return +d[chartState.measure];
        }));

        //set x axis
        let xAxis = d3.axisBottom(xScale)
            .ticks(12, ".0f");


        d3.transition(svg).select(".x.axis")
            .transition()
            .duration(1000)
            .call(xAxis);

        // Create simulation with specified dataset
        let simulation = d3.forceSimulation(dataSet)
            // Apply positioning force to push nodes towards desired position along X axis
            .force("x", d3.forceX(function(d) {
                // Mapping of values from date/perCapita column of dataset to range of SVG chart (<margin.left, margin.right>)
                return xScale(+d[chartState.measure]); // This is the desired position
            }).strength(8)) // Increase velocity
            .force("y", d3.forceY((height / 1.75) - margin.bottom)) // // Apply positioning force to push nodes towards center along Y axis
            .force("collide", d3.forceCollide(16)) // Apply collision force with radius of 9 - keeps nodes centers 9 pixels apart
            .stop(); // Stop simulation from starting automatically

        // Manually run simulation
        for (let i = 0; i < dataSet.length; ++i) {
            simulation.tick(5);
        }

        //fill circles with images
        var defs = svg.append('defs');

        defs.append("pattern")
            .attr("id", "d.title")
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("height", 1)
            .attr("width", 1)
            .attr("preserveAspectRatio", "none")
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("xlink:href", "+ d.primaryImage +")

        defs.selectAll(".title-pattern")
            .data(data)
            .enter().append("pattern")
            .attr("class", "title-pattern")
            .attr("id", function(d) {
                return d.id
            })
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("height", 1)
            .attr("width", 1)
            .attr("preserveAspectRatio", "none")
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("xlink:href", function(d) {
                return d.primaryImage
            })

        //create circles


        let titleCircles = svg.selectAll(".title")
            .data(dataSet, function(d) { return d.title });

        titleCircles.exit()
            .transition()
            .duration(1000)
            .attr("cx", 0)
            .attr("cy", (height / 2) - margin.bottom / 2)
            .remove();

        titleCircles.enter()
            .append("circle")
            .attr("class", "title")
            .attr("cx", 0)
            .attr("cy", (height / 2) - margin.bottom / 2)
            // .attr("cx", width - margin.right)
            // .attr("cy", (height) - margin.bottom)
            .attr("r", 13)
            .attr("stroke", function(d) { return colors(d.typeSort) })
            .attr("stroke-width", 4)
            .on("mouseout", handleMouseOut)
            .on("mouseover", handleMouseOver)
            //     .on("mouseover", function(){
            // d3.select(this).raise()
            //     })
            .on("click", clicked)
            .merge(titleCircles)
            .transition()
            .duration(1000)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("fill", function(d, i) { return colors(d.typeSort); })
            //modal attributes
            .attr('data-toggle', 'modal')
            .attr('data-target', '#exampleModal')
            .attr('data-id', function(d) {
                return d.id
            })
            .attr('data-title', function(d) {
                return d.title
            })
            .attr('data-typeTrue1', function(d) {
                return d.typeTrue1
            })
            .attr('data-description1', function(d) {
                return d.description1
            })
            .attr('data-dateTrue1', function(d) {
                return d.dateTrue1
            })
            .attr('data-filename1', d => {
                // all our images are in the "images"
                // folder which we will need to 
                // add to our filename first
                return './downloads/' + d.filename1
                // return d.primaryImage
                // return d.primaryImage
            })
        magnify("imageMagnify", 2);



        function handleMouseOver(d, i) { // Add interactivity
            // Use D3 to select element, change size
            d3.select(this)
                .attr("r", 50)
                .attr("fill", function(d) {
                    return "url(#" + d.id + ")"
                })

            d3.select(this).raise()
            tooltip.style("opacity", 1)
            var me = d3.select(this)
            console.log(me.classed("selected"))
            me.classed("selected", !me.classed("selected"))
        };


        function handleMouseOut(d, i) {
            // Use D3 to select element, change color back to normal
            d3.select(this)
                .attr("r", 13)
                .attr("fill", function(d, i) { return colors(d.typeSort); })
            tooltip.style("opacity", 0);
            xLine.attr("opacity", 0);
            var me = d3.select(this)
            console.log(me.classed("selected"))
            me.classed("selected", !me.classed("selected"))
        };

        function clicked(d) {

            var me = d3.select(this)
            console.log(me.classed("selected"))
            me.classed("selected", !me.classed("selected"))

            // d3.selectAll("circle")
            //     .style("fill", function(d, i) { return colors(d.typeSort); })

            d3.selectAll("circle.selected")
                .style("fill", function(d) {
                    return "url(#" + d.id + ")"
                })

            svg.selectAll(".title")
                .on("mouseover", handleMouseOver2)
                .on("mouseout", handleMouseOut2)




        }


    }


    // Show tooltip when hovering over circle
    d3.selectAll(".title").on("mousemove", function(d) {
        tooltip.html(`<div>
                          <strong>${d.title}</strong><br>
                          ${d.typeTrue1}<br> 
                          <strong>${d.dateTrue1}</strong><br>
                          </div>
                          `)
            .style('top', d3.event.pageY - 1 + 5 + 'px')
            .style('left', d3.event.pageX + 1 + 10 + 'px')
            .style("opacity", 0.9)
        // .style("left", d3.select(this).attr("cx") + "px")
        // .style("top", d3.select(this).attr("cy") + "px");

        xLine.attr("x1", d3.select(this).attr("cx"))
            .attr("y1", d3.select(this).attr("cy"))
            .attr("y2", (height - margin.bottom))
            .attr("x2", d3.select(this).attr("cx"))
            .attr("opacity", 1)

    }).on("mouseout", function(_) {
        tooltip.style("opacity", 0);
        xLine.attr("opacity", 0);
    });




    // Filter data based on which checkboxes are ticked
    function filter() {

        function getCheckedBoxes(checkboxName) {

            let checkboxes = d3.selectAll(checkboxName).nodes();
            let checkboxesChecked = [];
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    checkboxesChecked.push(checkboxes[i].defaultValue);
                }
            }
            return checkboxesChecked.length > 0 ? checkboxesChecked : null;

        }

        let checkedBoxes = getCheckedBoxes(".typeSort");

        let newData = [];

        if (checkedBoxes == null) {
            dataSet = newData;
            redraw();
            return;
        }

        for (let i = 0; i < checkedBoxes.length; i++) {
            let newArray = data.filter(function(d) {
                return d.typeSort === checkedBoxes[i];
            });
            Array.prototype.push.apply(newData, newArray);
        }

        dataSet = newData;
        redraw();
        var me = d3.select(this)
        console.log(me.classed("selected"))
        me.classed("selected", !me.classed("selected"))

        // d3.selectAll("circle")
        //     .style("fill", function(d, i) { return color(d.typeSort); })


        d3.selectAll("circle.selected")
            .style("fill", function(d) {
                return "url(#" + d.id + ")"
            })

    }

    ///Modal///
    $('#exampleModal').on('show.bs.modal', function(event) {

        var button = $(event.relatedTarget) // Button that triggered the modal
        var recipient = button.data('id') // Extract info from data-* attributes
        var imge = button.data('filename1')
        var titleModal = button.data('title')
        var descriptModal = button.data('description1')
        var dateModal = button.data('dateTrue1')
        var typeModal = button.data('typeTrue1')
        console.log(recipient)
        var modal = $(this)
        modal.find('.modal-title').html(titleModal)
        // modal.find('.col-md-5').html('<img id="image2" src= "' + imge + '"></img>')
        modal.find('img').attr("src", imge)
        // modal.find('.modal-year').text(yearModal)
        // modal.find('.modal-type').text(typeModal)
        modal.find('p').html(descriptModal)
        modal.find('h3').text(dateModal)
        modal.find('h4').text(typeModal)

        magnify("imageMagnify", 2)
        if ($('.img-magnifier-glass').length === -1) {
            magnify("imageMagnify", 2)
        }
        else {
            $('.img-magnifier-glass').remove();
        }
        magnify("imageMagnify", 2);

    })




function magnify(imgID, zoom) {
        var img, glass, w, h, bw;
        img = document.getElementById(imgID);

        img.onload = function(){
            let iw = this.width;
            let ih = this.height;

            /*create magnifier glass:*/
            glass = document.createElement("DIV");
            glass.setAttribute("class", "img-magnifier-glass");

            /*insert magnifier glass:*/
            console.log(imgID, img, img.width);

            img.parentElement.insertBefore(glass, img);
            /*set background properties for the magnifier glass:*/
            glass.style.backgroundImage = "url('" + img.src + "')";
            glass.style.backgroundRepeat = "no-repeat";
            glass.style.backgroundSize = (iw * zoom) + "%" + (ih * zoom) + "%";
            bw = 3;
            w = glass.offsetWidth; // /2
            h = glass.offsetHeight; // /2
            /*execute a function when someone moves the magnifier glass over the image:*/
            glass.addEventListener("mousemove", moveMagnifier);
            img.addEventListener("mousemove", moveMagnifier);
            /*and also for touch screens:*/
            glass.addEventListener("touchmove", moveMagnifier);
            img.addEventListener("touchmove", moveMagnifier);
        }


        function moveMagnifier(e) {
            var pos, x, y;
            /*prevent any other actions that may occur when moving over the image*/
            e.preventDefault();
            /*get the cursor's x and y positions:*/
            pos = getCursorPos(e);
            x = pos.x;
            y = pos.y;
            /*prevent the magnifier glass from being positioned outside the image:*/
            if (x > img.width - (w / zoom)) { x = img.width - (w / zoom); }
            if (x < w / zoom) { x = w / zoom; }
            if (y > img.height - (h / zoom)) { y = img.height - (h / zoom); }
            if (y < h / zoom) { y = h / zoom; }
            /*set the position of the magnifier glass:*/
            glass.style.left = (x - w) + "px";
            glass.style.top = (y - h) + "px";
            /*display what the magnifier glass "sees":*/
            glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
        }


        function getCursorPos(e) {
            var a, x = 0,
                y = 0;
            e = e || window.event;
            /*get the x and y positions of the image:*/
            a = img.getBoundingClientRect();
            /*calculate the cursor's x and y coordinates, relative to the image:*/
            x = e.pageX - a.left;
            y = e.pageY - a.top;
            /*consider any page scrolling:*/
            x = x - window.pageXOffset;
            y = y - window.pageYOffset;
            return { x: x, y: y };
        }
    }


    // magnify("imageMagnify", 3);

}).catch(function(error) {
    if (error) throw error;
});
