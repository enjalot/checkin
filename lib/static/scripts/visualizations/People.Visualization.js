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
		var convertKeys = {
			"member": "member",
			"yes": "rsvp",
			"no": "no rsvp",
			"waitlist": "waitlist",
			"checkin": "checked in",
			"guest": "guest"
		}
		var data = {}, 
			svg, g, image, arcs, text
			width = 250,
			size = app.faceSize,
			arcPadding = 2,
			arcSize = 5,
			arc = d3.svg.arc()
				.innerRadius(size / 2 + arcPadding)
				.outerRadius((size / 2) + arcPadding * 2 + arcSize)
				.startAngle(function(d, i) {
					return (Math.PI * 2 * i) / 3;
				}).endAngle(function(d, i) {
					return (Math.PI * 2 * (i + 1)) / 3;
				});


		function Circle(selection) {
			g = d3.select(selection)
				.append("g").classed("faceCircle", true)
				.attr("transform", "translate(" + (width / 2 - size / 2) 
					+ "," + (arcPadding * 2 + arcSize * 2) + ")")
				.datum(data);

			image = g.append("image")
				.attr("xlink:href", "/static/images/p0wny.png")
				.attr("width", app.faceSize)
				.attr("height", app.faceSize)
				.attr("x", 0)
				.attr("y", 0)
				.attr("opacity", 0.25)
				.attr("clip-path", "url(#clipCircle)");

			arcs = g.append("g").classed("arcs", true)
				.attr("transform", "translate(" + size / 2 + ", " + size / 2 + ")");

			arcs.selectAll("path.arc").data(data.arcs).enter().append("path")
				.classed("arc", true).attr("d", arc)
				.attr("fill", function(d) {return app.colors[d]})
				.attr("stroke", "#fff")
				.attr("stroke-width", arcPadding);

			text = g.append("text")
				.classed("memberName", true)
				.attr("x", size / 2)
				.attr("y", size + arcPadding * 8 + arcSize * 4)
				.attr("text-anchor", "middle")
				.attr("fill", "#999")
				.text(function(d) {return d.name});
		}

		Circle.updateImage = function() {
			image.attr("xlink:href", function(d) {return d.url})
				.attr("width", function(d) {return d.width})
				.attr("height", function(d) {return d.height})
				.attr("opacity", 1);
		}

		Circle.update = function() {
			arcs.selectAll("path.arc").data(data.arcs).enter().append("path")
				.classed("arc", true).attr("d", arc)
				.attr("fill", function(d) {return app.colors[d]})
				.attr("stroke", "#fff")
				.attr("stroke-width", arcPadding);
			arcs.selectAll("path.arc").data(data.arcs).exit().remove();
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