/* global d3 */

var w = 1345,
    h = 750;

var radius = 12;
var color = d3.scaleOrdinal()
    .domain(["buttons", "signs", "posters", "placards", "correspondence", "pamphlets", "fliers", "other"])
    .range(['#d4c874', '#ba8a30', '#db666f', '#5c86aa', '#a53d24', '#76943c', '#66988d', '#ba5f41']);

var centerScale = d3.scalePoint().padding(1.4).range([1, w]);
var forceStrength = 0.08;


///////////////// labels for clusters ////////////////
function hideTitles() {
    svg2.selectAll('.title2').remove();
}


function showTitles(byVar, scale) {
    var titles = svg2.selectAll('.title2')
        .data(scale.domain())



    titles.enter().append('text')
        .attr('class', 'title2')
        .merge(titles)
        .attr('x', function(d, i) { return scale(d) * 1.18 + i - 120; })
        // .attr('x', function(d,i ) { return 200*i+75 })
        .attr('y', 190)
        // .attr('text-anchor', 'left')
        .text(function(d) { return d; });


    titles.exit().remove()
}


var svg2 = d3.select("#svgclusters").append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("viewBox", `0 0 1400 750`)
    .attr("preserveAspectRatio", "xMinYMin meet")


var simulation = d3.forceSimulation()
    .force("collide", d3.forceCollide(function(d) {
        return d.r + 2
    }).iterations(10))
    .force("charge", d3.forceManyBody())
    .force("y", d3.forceY().y(h / 2))
    .force("x", d3.forceX().x(w / 2))
d3.csv("./beeswarm-data-new-rev_dec1.csv").then(function(data2) {

    data2.forEach(function(d) {
        d.r = radius;
        d.x = w / 2;
        d.y = h / 2;
    })

    // console.log(data);


    //////to fill each bubble with image//////
    var defs2 = svg2.append('defs2');

    defs2.append("pattern")
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

    defs2.selectAll(".title-pattern2")
        .data(data2)
        .enter().append("pattern")
        .attr("class", "title-pattern2")
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



    function handleMouseOver2(d, i) {

        d3.select(this)
            .attr("r", 50)
            .style("fill", function(d) {
                return "url(#" + d.id + ")";
            })

            .raise()

        d3.selectAll("circle.selected")
            .style("fill", function(d) {
                return "url(#" + d.id + ")"
            })
    }


    function handleMouseOut2(d, i) {
        // Use D3 to select element, change color back to normal
        d3.select(this)
            .attr("r", 13)
            .style("fill", function(d, i) { return color(d.typeSort); })
        tooltip.style("opacity", 0);
        xLine.attr("opacity", 0);
        d3.selectAll("circle.selected")
            .style("fill", function(d) {
                return "url(#" + d.id + ")"
            })

    };


    var circles = svg2.selectAll("circle")
        .data(data2, function(d) { return d.id; });

    var circlesEnter = circles.enter().append("circle")
        .attr("r", function(d, i) { return d.r; })
        .attr("cx", function(d, i) { return 175 + 25 * i + 2 * i ** 5; })
        .attr("cy", function(d, i) { return 500; })
        .style("fill", function(d, i) { return color(d.typeSort); })
        .style("stroke", function(d, i) { return color(d.typeSort); })
        .style("stroke-width", 3)
        .style("pointer-events", "all")
        .style("padding", "none")
        .style("color", "white")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", handleMouseOver2)
        .on("mouseout", handleMouseOut2)
        // .on("click", clicked2)
        //modal attributes
        .attr('data-toggle', 'modal')
        .attr('data-target', '#exampleModal')
        .attr('data-id', function(d) {
            return d.id
        })
        .attr('data-title', function(d) {
            return d.title
        })
        // .attr('data-typeTrue1', function(d) {
        //     return d.typeTrue1
        // })
        .attr('data-description1', function(d) {
            return d.description1
        })
        // .attr('data-dateTrue1', function(d) {
        //     return d.dateTrue1
        // })
        .attr('data-filename1', d => {
            // all our images are in the "images"
            // folder which we will need to 
            // add to our filename first
            return './downloads/' + d.filename1
            // return d.primaryImage
            // return d.primaryImage
        })


    circles = circles.merge(circlesEnter)

    d3.selectAll("circle")
        .on("mouseover", handleMouseOver2)
        .on("mouseout", handleMouseOut2);


    function ticked() {
        //console.log("tick")
        //console.log(data.map(function(d){ return d.x; }));
        circles
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        d3.selectAll("circle.selected")
            .style("fill", function(d) {
                return "url(#" + d.id + ")"
            })
    }

    simulation
        .nodes(data2)
        .on("tick", ticked);

    function dragstarted(d, i) {
        //console.log("dragstarted " + i)
        if (!d3.event.active) simulation.alpha(1).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.selectAll("circle.selected")
            .style("fill", function(d) {
                return "url(#" + d.id + ")"
            })
    }

    function dragged(d, i) {
        //console.log("dragged " + i)
        d.fx = d3.event.x;
        d.fy = d3.event.y;
        d3.selectAll("circle.selected")
            .style("fill", function(d) {
                return "url(#" + d.id + ")"
            })
    }


    function dragended(d, i) {
        //console.log("dragended " + i)
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        var me = d3.select(this)
        console.log(me.classed("selected"))
        me.classed("selected", !me.classed("selected"))

        // d3.selectAll("circle")
        //     .style("fill", function(d, i) { return color(d.typeSort); })


        d3.selectAll("circle.selected")
            .style("fill", function(d) {
                return "url(#" + d.id + ")"
            })
        d3.selectAll("circle")
            .on("mouseover", handleMouseOver2)
            .on("mouseout", handleMouseOut2);
        svg.selectAll(".title")
            .on("mouseover", handleMouseOver2)
            .on("mouseout", handleMouseOut2);

    }



    function groupBubbles() {
        hideTitles();
        simulation.force('x', d3.forceX().strength(.05));
        simulation.alpha(1).restart();
    }


    function splitBubbles(byVar) {

        centerScale.domain(data2.map(function(d) { return d[byVar]; }));

        if (byVar == "id") {
            hideTitles()
        }
        else {
            showTitles(byVar, centerScale);
        }

        simulation.force('x', d3.forceX().strength(forceStrength).x(function(d) {
            return centerScale(d[byVar]);
        }));
        simulation.alpha(1.2).restart();
    }





    function setupButtons() {
        d3.selectAll('.button')
            .on('click', function() {

                // Remove active class from all buttons
                d3.selectAll('.button').classed('active', false);
                // Find the button just clicked
                var button = d3.select(this);

                // Set it as the active button
                button.classed('active', true);

                // Get the id of the button
                var buttonId = button.attr('id');

                console.log(buttonId)
                // Toggle the bubble chart based on
                // the currently clicked button.
                splitBubbles(buttonId);
            });
    }

    setupButtons()

})
