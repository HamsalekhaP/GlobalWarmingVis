// Rainfall graph

var rain_svg = d3.select('#leftish').append('svg').attr('id', 'rainfall');

// data filtering
// set from map
var country = 'IND'
// set from slider
var yearOfView = '2016'
// selected country and year's statistics

var rainfallStats = null
rain_svg.attr("class", "auto-width");
rain_svg.style("height", "350");


var margin = { top: 30, right: 20, bottom: 30, left: 40 };

var bounds = rain_svg.node().getBoundingClientRect(),
  width = bounds.width - margin.left - margin.right,
  height = bounds.height - margin.top - margin.bottom,
  x = d3.scalePoint(),
  y = d3.scaleLinear();

var g = rain_svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

g.append("g")
  .attr("class", "axis axis--x");

g.append("g")
  .attr("class", "axis axis--y");

var title = g.append("text") // Title
  .attr("x", (width / 2))
  .attr("y", 0 - (margin.top / 4))
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .style("text-decoration", "underline")
  .text("Rainfall Distribution in year " + yearOfView + " in " + country);

g.append("text") // text label for the y axis
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "0.71em")
  .style('font-size', '12')
  .attr("text-anchor", "middle")
  .text("Rainfall in mm");

g.append("text") // text label for the x axis
  .attr("x", width / 2)
  .attr("y", height + margin.bottom)
  .style("text-anchor", "middle")
  .style('font-size', '12')
  .text("Month");

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Rainfall(mm):</strong> <span>" + d.Rainfall + "</span>";
    // return " <i class='fas fa-cloud-rain' style='font-size:60px;color:red'></i><span>" + d.Rainfall + "</span>";

  });

g.call(tip);

// To DO get range from whole set or country wise
var rainfallDataProcessing = function(isUpdate) {
  d3.csv('./data/rainfall.csv', function(data) {
    var filterData = data.filter(function(d) {
      if (d['ISO3'] == country && d['Year'] == yearOfView) {
        return d
      }
    })
    rainfallStats = filterData
    x.domain(filterData.map(function(d, i) {
      return d.Statistics;
    }));
    y.domain([0, d3.max(filterData, function(d, i) {
      return parseFloat(d.Rainfall);
    })]);
    if (isUpdate) {
      updateChart(filterData)
    } else {
      drawBarChart(filterData)
    }
  })
};


// TOD check y range when exceeds height of svg
function drawBarChart(r_data) {
  x.rangeRound([0, width]);
  y.rangeRound([height, 0]);
  g.select(".axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  g.select(".axis--y")
    .call(d3.axisLeft(y));
  g.selectAll(".rainfall_bar")
    .data(r_data)
    .enter().append("rect")
    .attr('class', 'rainfall_bar')
    .attr('width', 20)
    .attr('x', function(d, i) {
      return x(d.Statistics);
    })
    // to produce bar transition from botton instead of top
    .attr("y", function(d) {
      return y(0);
    })
    .attr("height", 0)
    .transition()
    .duration(800)
    .attr('y', function(d) {
      // console.log(height, '-', parseFloat(d.Rainfall), '=', height - parseFloat(d.Rainfall), y(parseFloat(d.Rainfall)));
      return y(parseFloat(d.Rainfall));
    })
    .attr('height', function(d) {
      // console.log(d.Rainfall, height - y(d.Rainfall));
      return height - y(d.Rainfall);
    })
    .delay(function(d, i) { return (i * 50) });


  g.selectAll('rect')
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)

}
rainfallDataProcessing(false)

function updateChart(r_data) {
  y.domain([0, d3.max(r_data, function(d, i) {
    return parseFloat(d.Rainfall);
  })]);
  g.selectAll('rect')
    .transition()
    .delay(function(d, i) { return i * 50; })
    .duration(500)
    .attr('y', function(d) {
      return y(parseFloat(d.Rainfall));
    })
    .attr('height', function(d) {
      return height - y(d.Rainfall);
    })
}

d3.select("#mySlider").on("change", function() {
  selectedValue = this.value
  title.text("Rainfall Distribution in year " + selectedValue + " in " + country);
  yearOfView = selectedValue
  rainfallDataProcessing(true)
  // updateChart()
})



// Code for Rainfall graph ends here