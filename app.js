var yearOfView = '1991'
//console.log("hahahah")
var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
  .attr('class', 'd3-tip s')
  .offset(function(d) {
    if (d.properties.name === "Russia") {
      return [-10, 200]
    } else return [-10, 0]
  })
  .html(function(d) {
    if (isNaN(d.temperature)){
      return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Temperature: </strong><span class='details'>" 
    + format(d.temperature) + "<br></span>" + "<strong>Tempertature compared to 1991: </strong><span class='details'>" + format(d.difference) + "<br></span>";
    }else{
      return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Temperature: </strong><span class='details'>" 
    + format(d.temperature) + "°C <br></span>" + "<strong>Tempertature compared to 1991: </strong><span class='details'>" + format(d.difference) + "°C <br></span>";
    }    
  })

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
  width = 900 - margin.left - margin.right,
  height = 720 - margin.top - margin.bottom;
// width = 1920 - margin.left - margin.right,
// height = 1000 - margin.top - margin.bottom;

var color = d3.scaleThreshold()
     .domain([-100, -1, -0.5, -0.1, 0, 0.1, 1, 1.5, 2, 2.5])
     .range(["rgb(255,255,255)", "rgb(66,146,198)", "rgb(123,169,201)", "rgb(198,219,239)", "rgb(250,240,230)", "rgb(255,204,153)", "rgb(255,178,102)", "rgb(255,128,0)", "rgb(255,0,0)", "rgb(204,0,0)"])
     

var path = d3.geoPath();
var svg = d3.select(".map-panel")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append('g')
  .attr('class', 'map');

// ranslate is bacially shifting projection width/2 pixels left and height/2 from top.
// Considering origin as top left. IDK how the projection is being made. I think you need ot know this to adjust the sizes

var projection = d3.geoMercator().scale(100)
  .translate([width / 2, height / 2.1]);

var path = d3.geoPath().projection(projection);
svg.call(tip);

queue()
  .defer(d3.json, "world_countries.json")
  .defer(d3.csv, "country_avg_temp.csv")
  .await(ready);
//console.log("haha");

var g = svg.append("g")
  .attr("class", "legendThreshold")
  .attr("transform", "translate(20,20)");
g.append("text")
  .attr("class", "caption")
  .attr("x", 0)
  .attr("y", -6)
  .text("Temperature difference (°C)");
var labels = ['No data','<-1', '-1~-0.5', '-0.5~-0.1', '-0.1~0.1', '0.1~0.5', '0.5~1', '1~1.5', '1.5~2', '>2'];
var legend = d3.legendColor()
  .labels(function (d) { return labels[d.i]; })
  .shapePadding(4)
  .scale(color);
svg.select(".legendThreshold")
  .call(legend);

d3.select("#mySlider").on("change", function() {
  selectedValue = this.value
  //title.text("Rainfall Distribution in year " + selectedValue + " in " + country);
  yearOfView = selectedValue
  queue()
  .defer(d3.json, "world_countries.json")
  .defer(d3.csv, "country_avg_temp.csv")
  .await(ready);
  //rainfallDataProcessing(true)
})

function filterCriteria(d) {
  //console.log("filteredCriteria called");
  return d.year === yearOfView;
}

function startTempFilter(d){
  return d.year === '1991';
}

function ready(error, data, temperature) {
  var startTemp = temperature.filter(startTempFilter);
  var filteredTemp = temperature.filter(filterCriteria);
  var startTemps = {};
  var temperatureById = {};
  var differences = {};
  startTemp.forEach(function(d) { startTemps[d.id] = +d.temperature; })
  filteredTemp.forEach(function(d) { temperatureById[d.id] = +d.temperature; });
  data.features.forEach(function(d) { d.temperature = temperatureById[d.id] });

  startTemp.forEach(function(d) {
    if (isNaN(temperatureById[d.id])){
      differences[d.id] = -100;
    }else{
      differences[d.id] = (temperatureById[d.id] - startTemps[d.id]).toFixed(3);
    }
  });
  data.features.forEach(function(d) { d.difference = differences[d.id] });
  //console.log(differences);
 // console.log(data.features);
  svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(data.features)
    .enter().append("path")
    .attr("d", path)
    .style("fill", function(d) { 
      // console.log("South Africa " + color(differences['ZAF']));
      // console.log("Mongolia: " + color(differences['MNG']))
      if (typeof differences[d.id] === "undefined"){
        return "rgb(255,255,255)";
      }else{
        return color(differences[d.id]);
      }
    })
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    .style("opacity", 0.8)
    // tooltips
    .style("stroke", "white")
    .style('stroke-width', 0.3)
    .on('mouseover', function(d) {
      //console.log(d.geometry.coordinates[0][0][0][1]);
      if (d.geometry.coordinates[0][0][0][1] <= 0) {
        tip.direction('n').show(d);
        //console.log("first one")
      } else {
        tip.direction('s').show(d);
        //console.log("second")
      }     
      d3.select(this)
        .style("opacity", 1)
        .style("stroke", "white")
        .style("stroke-width", 3);
      })
    .on('mouseout', function(d) {
      tip.hide(d);
 
      d3.select(this)
        .style("opacity", 0.8)
        .style("stroke", "white")
        .style("stroke-width", 0.3);
    }).attr("transform", "scale(1)"); // determine if it would be better to have larger map later

  svg.append("path")
    .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
    // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
    .attr("class", "names")
    .attr("d", path);
}


