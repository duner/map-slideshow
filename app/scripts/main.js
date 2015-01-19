"use strict";

// var d3 = require("d3");
// require("d3-geo-projection")(d3);

var width = $("#map").width();
var height = $("#map").height();

console.log(width, height);

var projection = d3.geo.mercator()
    // .scale(475)
    .scale(350)
    .translate([width / 2, height / 1.5])
    // .clipAngle(90)
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule();

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");

// svg.append("path")
//     .datum(graticule)
//     .attr("class", "graticule")
//     .attr("d", path);

d3.json("/scripts/world-50m.json", function(error, world) {
  svg.insert("path", ".graticule")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

  svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path);
});

d3.select(self.frameElement).style("height", height + "px");

