$(document).ready(function(){

  var width = $("#map").width();
  var height = $("#map").height();
  var active = d3.select(null);

  var projection = d3.geo.mercator()
    .scale(350)
    .translate([width / 2, height / 1.5])
    .precision(0.1);

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

  svg.append("path")
    .datum(graticule)
    .attr("class", "graticule");
    // .attr("d", path);

  var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  var g = svg.append("g");

  svg
    .call(zoom) // delete this line to disable free zooming
    .call(zoom.event);

  d3.json("/scripts/world-50m.json", function(error, world) {

    countries = topojson.feature(world, world.objects.countries)
    console.log(countries);

    g.selectAll("path")
      .data(countries.features)
    .enter().append("path")
      .attr("class", "country")
      .attr("data-id", function(d) {
        if (d.id == 4) { console.log(d); }
        console.log(d.id)
        return d.id;
        })
      .attr("d", path)
      .on("click", clicked);

    g.append("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path);
  });

  function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);
  }

  function reset() {
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
  }

  function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.scale + "px");
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  // If the drag behavior prevents the default click,
  // also stop propagation so we don’t click-to-zoom.
  function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
  }

  d3.select(self.frameElement).style("height", height + "px");

});
