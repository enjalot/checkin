define([
	"jquery",
	"underscore",
	"d3"
], function(
	$,
	_,
	d3
) {
	return function() {
		var data, svg, g, image, arcs,
			size = app.faceSize,
			arcPadding = 3,
			arcSize = 5,
			arc = d3.svg.arc()
				.innerRadius(size / 2 + arcPadding)
				.outerRadius((size / 2) + arcPadding + arcSize)
				.startAngle(function(d, i) {
					console.log(d, i);
					return (Math.PI * 2 * i) / 3;
				}).endAngle(function(d, i) {
					return (Math.PI * 2 * (i + 1)) / 3;
				});


		function Circle(selection) {
			g = d3.select(selection)
				.append("g").classed("faceCircle", true)
				.attr("transform", "translate(" + (arcSize + arcPadding) + "," + (arcSize + arcPadding) + ")")
				.datum(data);

			g.append("clipPath")
				.attr("id", "clipCircle")
				.append("circle")
				.attr("cx", size / 2)
				.attr("cy", size / 2)
				.attr("r", size / 2);
			image = g.append("image")
				.attr("xlink:href", function(d) {return d.url})
				.attr("width", function(d) {return d.width})
				.attr("height", function(d) {return d.height})
				.attr("x", 0)
				.attr("y", 0)
				.attr("clip-path", "url(#clipCircle)");

			arcs = g.append("g").classed("arcs", true)
				.attr("transform", "translate(" + size / 2 + ", " + size / 2 + ")");

			arcs.selectAll("path.arc").data(data.arcs).enter().append("path")
				.classed("arc", true).attr("d", arc)
				.attr("fill", function(d) {return app.colors[d]})
				.attr("stroke", "none");
		}

        /* getter/setters */
        Circle.data = function(value) {
            if (!arguments.length) return data;
            data = value;
            return Circle;
        }

		return Circle;
	}
});