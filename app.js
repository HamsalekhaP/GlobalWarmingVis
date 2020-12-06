seaLevel = {

}
// SETUP
// var data;
var svg_sea = d3.select("#vis1"),
  margin_sea = { top: 30, right: 20, bottom: 30, left: 40 },
  x = d3.scaleBand().padding(0.1),
  y = d3.scaleLinear();

// var myScale = d3.scaleLinear()
// .domain([0, 10])
// .rangeRound([0, 600]);

var bounds_sea = svg_sea.node().getBoundingClientRect(),
  width = bounds_sea.width - margin_sea.left - margin_sea.right,
  height = bounds_sea.height - margin_sea.top - margin_sea.bottom;


var g_sea = svg_sea.append("g")
  .attr("transform", "translate(" + margin_sea.left + "," + margin_sea.top + ")");

g_sea.append("g")
  .attr("class", "axis axis--x");

g_sea.append("g")
  .attr("class", "axis axis--y");

// label "Sea Level"
g_sea.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end") // attribute: start, middle, end
  .text("Global Sea Level: GMSL");

// label "year"
g_sea.append("text")
  .attr("x", width)
  .attr("y", height-20)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end") // attribute: start, middle, end
  .text("Year");


d3.csv("data/sealevel.csv", function (d) {
  x.domain(d.map(function (d, i) { return d.Time; })); // [A, B, C, D...]
  y.domain([0, d3.max(d, function (d, i) { return d.GMSL; })]);
  draw(d);
})


function draw(d) {
  x.rangeRound([0, width]);
  y.rangeRound([height, 0]);

  g_sea.select(".axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g_sea.select(".axis--y")
    .call(d3.axisLeft(y).ticks(20));

  var line = d3.line()
    .x(function (d, i) { return x(d.Time); })
    .y(function (d, i) { return y(d.GMSL); })

  // g.data(d);
  // data = d
  g_sea.append("path")
    .datum(d)
    .attr("class", "line")
    .attr("stroke", "#FDC40D")
    .attr("stroke-width", 7)
    .attr("fill", "none")
    .attr("d", line);

  // g.selectAll(".dot")
  //     .data(d)
  //   .enter().append("circle") 
  //     .attr("class", "dot") 
  //     .attr("cx", function(d, i) { return x(d.Time) })
  //     .attr("cy", function(d, i) { return y(d.GMSL) })
  //     .attr("r", 5)

}





// CO2 = {

// }
// // SETUP
// // var data;
// var svg2 = d3.select("#vis2"),
//   margin = { top: 30, right: 20, bottom: 30, left: 40 },
//   x = d3.scaleBand().padding(0.1),
//   y = d3.scaleLinear();

// // var myScale = d3.scaleLinear()
// // .domain([0, 10])
// // .rangeRound([0, 600]);

// // var bounds = svg2.node().getBoundingClientRect(),
// //   width = bounds.width - margin.left - margin.right,
// //   height = bounds.height - margin.top - margin.bottom;


// var g2 = svg2.append("g")
//   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// g2.append("g")
//   .attr("class", "axis axis--x");

// g2.append("g")
//   .attr("class", "axis axis--y");

// // label "CO2"
// g2.append("text")
//   .attr("transform", "rotate(-90)")
//   .attr("y", 6)
//   .attr("dy", "0.71em")
//   .attr("text-anchor", "end") // attribute: start, middle, end
//   .text("Global CO2");

// // label "year"
// g2.append("text")
//   .attr("x", width)
//   .attr("y", 600)
//   .attr("dy", "0.71em")
//   .attr("text-anchor", "end") // attribute: start, middle, end
//   .text("year");


// d3.csv("data/co-demo.csv", function (d) {
//   x.domain(d.map(function (d, i) { return d.Year; })); // [A, B, C, D...]
//   y.domain([0, d3.max(d, function (d, i) { return d.emissions; })]);
//   draw_CO2(d);
// })


// function draw_CO2(d) {
//   x.rangeRound([0, width]);
//   y.rangeRound([height, 0]);

//   g2.select(".axis--x")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x));

//   g2.select(".axis--y")
//     .call(d3.axisLeft(y).ticks(20));

//   var line = d3.line()
//     .x(function (d, i) { return x(d.Year); })
//     .y(function (d, i) { return y(d.emissions); })

//   // g.data(d);
//   // data = d
//   g2.append("path")
//     .datum(d)
//     .attr("class", "line")
//     .attr("stroke", "#63E15D")
//     .attr("stroke-width", 3)
//     .attr("fill", "none")
//     .attr("d", line);

// }




// set the dimensions and margins of the graph
var margin_co2 = {top: 10, right: 30, bottom: 30, left: 40};

// append the svg object to the body of the page
var svg_co2 = d3.select("#vis2")
  .append("svg")
    .attr("width", width + margin_co2.left + margin_co2.right)
    .attr("height", height + margin_co2.top + margin_co2.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin_co2.left + "," + margin_co2.top + ")");

    
svg_co2.append("text")
          .attr("x", width)
          .attr("y", height-20)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end") // attribute: start, middle, end
          .text("Year");

svg_co2.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end") // attribute: start, middle, end
          .text("Annual CO2 emissions by world region");

//Read the data
d3.csv("data/co-demo.csv", function(data) {

  // group the data: I want to draw one line per group
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.Entity;})
    .entries(data);

  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.Year; }))
    .range([ 0, width ]);
  svg_co2.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.emissions; })])
    .range([ height, 0 ]);
  svg_co2.append("g")
    .call(d3.axisLeft(y));

  // color palette
  var res = sumstat.map(function(d){ return d.key }) // list of group names
  var color_co2 = d3.scaleOrdinal()
    .domain(res)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

  // Draw the line
  svg_co2.selectAll(".line")
      .data(sumstat)
      .enter()
      .append("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color_co2(d.key) })
        // .attr("stroke", "#63E15D")
        .attr("stroke-width", 5.5)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(+d.emissions); })
            (d.values)
        })
})