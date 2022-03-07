/*global d3 */

var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height"),
  innerRadius = 160,
  outerRadius = Math.min(width, height) / 2.25,
  g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var x = d3.scaleBand()
  .range([0, 2 * Math.PI])
  .align(0);

var y = d3.scaleRadial()
  .range([innerRadius, outerRadius]);

var z = d3.scaleOrdinal()
  // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#d0743c"]);

let tooltip = d3.create("div")
  .attr("class", "tooltip")
  .style("opacity", 1)
  .style("border", "1px solid #000")
  .style("color", "currentColor")
  .style("position", "absolute")
  .style("top", "50%")
  .style("left", "50%")
  .style("background", "#fff")
  .style("transform", "translate(-50%, -50%)")
  .html("<img src='rat-pic.svg' class='img-circle' height='80' width='80' alt='rat'>")

d3.select("#svg-wrapper")
  .append(() => tooltip.node())

// d3.csv("rats_2020.csv", function(d, i, columns) {
//   for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
//   d.total = t;
//   return d;
//   if (error) throw error;
//   console.log(data);
// });

d3.csv("rats_2020.csv", function(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}, function(error, data) {
  if (error) throw error;

  x.domain(data.map(function(d) { return d.Month; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]);
  z.domain(data.columns.slice(1));

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(data.columns.slice(1))(data))
    .enter().append("g")
    .attr("fill", function(d) { return z(d.key); })
    .selectAll("path")
    .data(function(d) { return d; })
    .enter().append("path")
    .attr("d", d3.arc()
      .innerRadius(function(d) { return y(d[0]); })
      .outerRadius(function(d) { return y(d[1]); })
      .startAngle(function(d) { return x(d.data.Month); })
      .endAngle(function(d) { return x(d.data.Month) + x.bandwidth(); })
      .padAngle(0.02)
      .padRadius(innerRadius))
    .on("mouseout", handleMouseOut)
    .on("mouseover", handleMouseOver);

  var label = g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("text-anchor", "middle")
    .attr("transform", function(d) { return "rotate(" + ((x(d.Month) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });

  label.append("line")
    .attr("x2", -5)
    .attr("stroke", "#dfdfdf");

  label.append("text")
    .attr("transform", function(d) { return (x(d.Month) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
    .text(function(d) { return d.Month; })
    .attr("fill", "#dfdfdf");

  var yAxis = g.append("g")
    .attr("text-anchor", "middle");

  var yAxis2 = g.append("g")

  var yTick = yAxis
    .selectAll("g")
    .data(y.ticks(5).slice(1))
    .enter().append("g");

  yAxis2.append("circle")
    .attr("fill", "none")
    .attr("stroke", "#dfdfdf")
    .attr("opacity", .3)
    .attr("r", y * 2);


  yTick.append("circle")
    .attr("fill", "none")
    .attr("stroke", "#dfdfdf")
    .attr("opacity", .3)
    .attr("r", y);

  yTick.append("text")
    .attr("y", function(d) { return -y(d); })
    .attr("dy", "0.35em")
    .attr("fill", "none")
    .attr("stroke", "#213441")
    .attr("stroke-width", 5)
    .text(y.tickFormat(5, "s"));

  yTick.append("text")
    .attr("y", function(d) { return -y(d); })
    .attr("dy", "0.35em")
    .attr("fill", "#dfdfdf")
    .text(y.tickFormat(5, "s"));

  yAxis.append("text")
    .attr("y", function(d) { return -y(y.ticks(5).pop()); })
    .attr("dy", "-1em")
    .attr("fill", "#dfdfdf")
    .attr("font-family", "'Montserrat', sans-serif")
    .attr("font-weight", "600")
    .text("Sighting Count");

  var legend = g.append("g")
    .selectAll("g")
    .data(data.columns.slice(1).reverse())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(-420," + (i - (data.columns.length + 33) / 2) * 20 + ")"; });

  // .attr("transform", function(d, i) { return "translate(-40," + (i - (data.columns.length - 1) / 2) * 20 + ")"; });

  legend.append("rect")
    .attr("width", 24)
    .attr("height", 18)
    .attr("fill", z);

  legend.append("text")
    .attr("x", 40)
    .attr("y", 10)
    .attr("dy", "0.35em")
    .attr("fill", "#dfdfdf")
    .attr("font-family", "'Montserrat', sans-serif")
    .attr("font-weight", "500")
    .attr("letter-spacing", "2px")
    .text(function(d) { return d; });
});

function handleMouseOver(event, i) { // Add interactivity
  // tooltip.style("opacity", 1)
  console.log(event)
  var boroughs = ["Brooklyn", "Manhattan", "Queens", "Bronx", "Staten Island"]

  // create html 
  var html = `
  <span>${event.data.Month}</span>
  ${boroughs.map(function(b){
    return `<div><p>${b}: ${event.data[b]}</p></div>`
  }).join('')}
`

  d3.selectAll("path").style("opacity", 0.5)
  d3.select(this)
    .style("opacity", 1)

  // pass that html to our tooltip
  tooltip.html(html)
  tooltip.style("opacity", .7)
};


function handleMouseOut(d, i) {
  // Use D3 to select element, change color back to normal
  tooltip.style("opacity", .8)
    .html("<img src='rat-pic.svg' class='img-circle' height='65' width='65' alt='rat'>")
  d3.selectAll("path").style("opacity", 1)
  d3.selectAll("rect").style("opacity", 1)


};


// Show tooltip when hovering over circle
// d3.selectAll("g").on("mousemove", function(d) {
//   tooltip.html(`<div>
//                   <strong>${d.Month}</strong><br>
//                 </div>
//               `)
//     // .attr("transform", function(d, i) { return "translate(-40," + (i - (data.columns.length - 1) / 2) * 20 + ")"; })
//   .style("opacity", 0.9)
//   .style("left", d3.select(this).attr("cx") + "px")
//   .style("top", d3.select(this).attr("cy") + "px");

// }).on("mouseout", function(_) {
//   tooltip.style("opacity", 0);
// });
