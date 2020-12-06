// Rainfall graph
var format = d3.format(",");

var country_id_map, rain_bounds, rain_g, rain_title, rain_tooltip, rain_x, rain_y;

var rain_svg = d3.select('#rainfall');

// data filtering
// set from map
var selected_country = 'USA';
// set from slider
var yearOfView = '1991';
// selected country and year's statistics

var rainfallStats = null;
var rain_svg_margin = { top: 30, right: 20, bottom: 30, left: 40 };


rain_svg.attr("class", "auto-width");
rain_svg.style("height", "430");


d3.json('./data/country_id_map.json', function(data) {
  country_id_map = data;

  rain_bounds = rain_svg.node().getBoundingClientRect(),
    r_width = rain_bounds.width - rain_svg_margin.left - rain_svg_margin.right,
    r_height = rain_bounds.height - rain_svg_margin.top - rain_svg_margin.bottom,
    rain_x = d3.scaleBand(),
    rain_y = d3.scaleLinear();

  rain_g = rain_svg.append("g")
    .attr("transform", "translate(" + rain_svg_margin.left + "," + rain_svg_margin.top + ")");

  rain_g.append("g")
    .attr("class", "axis axis--x");

  rain_g.append("g")
    .attr("class", "axis axis--y");


  rain_title = rain_g.append("text") // Title
    .attr("x", (r_width / 2))
    .attr("y", 0 - (rain_svg_margin.top / 4))
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("text-decoration", "underline")
    .text("Rainfall Distribution in year " + yearOfView + " in " + country_id_map[selected_country]);

  rain_g.append("text") // text label for the y axis
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - rain_svg_margin.left)
    .attr("x", 0 - (r_height / 2))
    .attr("dy", "0.71em")
    .attr('class', 'axis-label')
    .text("Rainfall in mm");

  rain_g.append("text") // text label for the x axis
    .attr("x", r_width / 2)
    .attr("y", r_height + rain_svg_margin.bottom)
    .attr('class', 'axis-label')
    .text("Month");

  rain_tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "Rainfall(mm): <span>" + d.Rainfall + "</span>";
      // return " <i class='fas fa-cloud-rain' style='font-size:60px;color:red'></i><span>" + d.Rainfall + "</span>";
    });

  rain_g.call(rain_tooltip);
})

// To DO get range from whole set or country wise??
var rainfallDataProcessing = function(isUpdate) {
  d3.csv('./data/rainfall.csv', function(data) {
    var filterData = data.filter(function(d) {
      if (d['ISO3'] == selected_country && d['Year'] == yearOfView) {
        return d
      }
    })
    rainfallStats = filterData

    rain_x.domain(filterData.map(function(d, i) {
      return d.Statistics;
    }));

    if (isUpdate) {
      updateBarChart(filterData)
    } else {
      rain_y.domain([0, d3.max(filterData, function(d, i) {
        return parseFloat(d.Rainfall);
      })]);
      drawBarChart(filterData)
    }
  })
};


function drawBarChart(r_data) {
  rain_x.rangeRound([0, r_width]);
  rain_y.rangeRound([r_height, 0]);
  rain_x.padding([0.2]);
  rain_g.select(".axis--x")
    .attr("transform", "translate(0," + r_height + ")")
    .call(d3.axisBottom(rain_x));
  rain_g.select(".axis--y")
    .call(d3.axisLeft(rain_y));
  rain_g.selectAll(".rainfall_bar")
    .data(r_data)
    .enter().append("rect")
    .attr('class', 'rainfall_bar')
    .attr('width', rain_x.bandwidth())
    .attr('x', function(d, i) {
      return rain_x(d.Statistics);
    })
    // to produce bar transition from bottom to top instead of top to bottom
    .attr("y", function(d) {
      return rain_y(0);
    })
    .attr("height", 0)
    .transition()
    .duration(800)
    .attr('y', function(d) {
      return rain_y(parseFloat(d.Rainfall));
    })
    .attr('height', function(d) {
      return r_height - rain_y(d.Rainfall);
    })
    .delay(function(d, i) { return (i * 50) });


  rain_g.selectAll('rect')
    .on("mouseover", rain_tooltip.show)
    .on("mouseout", rain_tooltip.hide)

}

rainfallDataProcessing(false)

function updateBarChart(r_data) {
  rain_y.domain([0, d3.max(r_data, function(d, i) {
    return parseFloat(d.Rainfall);
  })]);
  rain_g.select(".axis--y")
    .call(d3.axisLeft(rain_y));

  rain_g.selectAll('rect')
    .data(r_data)
    .transition()
    .delay(function(d, i) { return i * 50; })
    .duration(500)
    .attr('y', function(d) {
      return rain_y(parseFloat(d.Rainfall));
    })
    .attr('height', function(d) {
      return r_height - rain_y(d.Rainfall);
    })
}



d3.select("#mySlider").on("change", function() {
  yearOfView = this.value
  rain_title.text("Rainfall Distribution in year " + yearOfView + " in " + country_id_map[selected_country]);

  rainfallDataProcessing(true)

  selectedValue = this.value
  yearOfView = selectedValue
  queue()
    .defer(d3.json, "world_countries.json")
    .defer(d3.csv, "country_avg_temp.csv")
    .await(ready);
});
// Code for Rainfall graph ends here

var map_tip = d3.tip()
  .attr('class', 'd3-tip s')
  .offset(function(d) {
    if (d.properties.name === "Russia") {
      // Set tooltips
      return [-10, 200]
    } else return [-10, 0]
  })
  .html(function(d) {
    if (isNaN(d.temperature)) {
      return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Temperature: </strong><span class='details'>" +
        format(d.temperature) + "<br></span>" + "<strong>Tempertature compared to 1991: </strong><span class='details'>" + format(d.difference) + "<br></span>";
    } else {
      return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Temperature: </strong><span class='details'>" +
        format(d.temperature) + "°C <br></span>" + "<strong>Tempertature compared to 1991: </strong><span class='details'>" + format(d.difference) + "°C <br></span>";
    }
  })
var map_margin = { top: 0, right: 0, bottom: 0, left: 0 },
  width = 730 - map_margin.left - map_margin.right,
  height = 600 - map_margin.top - map_margin.bottom;
var map_color = d3.scaleThreshold()
  .domain([-100, -1, -0.5, -0.1, 0, 0.1, 1, 1.5, 2, 2.5])
  .range(["rgb(255,255,255)", "rgb(66,146,198)", "rgb(123,169,201)", "rgb(198,219,239)", "rgb(250,240,230)", "rgb(255,204,153)", "rgb(255,178,102)", "rgb(255,128,0)", "rgb(255,0,0)", "rgb(204,0,0)"])
var path = d3.geoPath();
var map_svg = d3.select(".map-wrapper")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append('g')
  .attr('class', 'map');
var projection = d3.geoMercator().scale(100)
  .translate([width / 2, height / 2.1]);
var path = d3.geoPath().projection(projection);
map_svg.call(map_tip);
queue()
  .defer(d3.json, "world_countries.json")
  .defer(d3.csv, "country_avg_temp.csv")
  .await(ready);

var map_g = map_svg.append("g")
  .attr("class", "legendThreshold")
  .attr("transform", "translate(20,20)");
map_g.append("text")
  .attr("class", "caption")
  .attr("x", 0)
  .attr("y", -6)
  .text("Temperature difference (°C)");
var map_label = ['No data', '<-1', '-1~-0.5', '-0.5~-0.1', '-0.1~0.1', '0.1~0.5', '0.5~1', '1~1.5', '1.5~2', '>2'];
var map_legend = d3.legendColor()
  .labels(function(d) { return map_label[d.i]; })
  .shapePadding(4)
  .scale(map_color);
map_svg.select(".legendThreshold")
  .call(map_legend);

function filterCriteria(d) {
  return d.year === yearOfView;
}

function startTempFilter(d) {
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
    if (isNaN(temperatureById[d.id])) {
      differences[d.id] = -100;
    } else {
      differences[d.id] = (temperatureById[d.id] - startTemps[d.id]).toFixed(3);
    }
  });
  data.features.forEach(function(d) { d.difference = differences[d.id] });
  map_svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(data.features)
    .enter().append("path")
    .attr("d", path)
    .style("fill", function(d) {
      if (typeof differences[d.id] === "undefined") {
        return "rgb(255,255,255)";
      } else {
        return map_color(differences[d.id]);
      }
    })
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    .style("opacity", 0.8)
    // tooltips
    .style("stroke", "white")
    .style('stroke-width', 0.3)
    .on('mouseover', function(d) {
      if (d.geometry.coordinates[0][0][0][1] <= 0) {
        map_tip.direction('n').show(d);
      } else {
        map_tip.direction('s').show(d);
      }
      d3.select(this)
        .style("opacity", 1)
        .style("stroke", "white")
        .style("stroke-width", 3);
    })
    .on('click', function(d) {
      selected_country = d['id']
      rain_title.text("Rainfall Distribution in year " + yearOfView + " in " + country_id_map[selected_country]);

      rainfallDataProcessing(true)

    })
    .on('mouseout', function(d) {
      map_tip.hide(d);

      d3.select(this)
        .style("opacity", 0.8)
        .style("stroke", "white")
        .style("stroke-width", 0.3);
    }).attr("transform", "scale(1)"); // determine if it would be better to have larger map later
  map_svg.append("path")
    .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
    .attr("class", "names")
    .attr("d", path);
}