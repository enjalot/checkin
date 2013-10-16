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
		var data, svg, g, image;


		function Circle(selection) {
			g = d3.select(selection)
				.append("g").classed("faceCircle", true);
				// .data(data);

			console.log(g);
			image = g.append("img").data(data)
				.attr("xlink:href", function(d) {console.log(d); return d.avatar})
				.attr("width", 50);
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