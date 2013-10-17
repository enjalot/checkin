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
		var data, svg, g, image,
			size = app.faceSize;


		function Circle(selection) {
			g = d3.select(selection)
				.append("g").classed("faceCircle", true)
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