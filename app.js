// Rainfall graph

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
})


// Code for Rainfall graph ends here