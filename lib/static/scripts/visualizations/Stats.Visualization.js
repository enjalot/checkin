define([
	"jquery",
	"underscore",
	"d3"
], function(
	$,
	_,
	d3
) {
	var convertKeys = {
		"yes": "rsvp",
		"no": "no rsvp",
		"waitlist": "waitlist",
		"checkin": "checked in",
		"guest": "guest"
	}
	return function() {
		var data, svg, g, arcPath, numerText, denomText,
			size = 135,
			padding = 25,
			arcSize = 5,
			arc = d3.svg.arc()
				.innerRadius((size / 2) - (arcSize / 2))
				.outerRadius(size / 2 + arcSize / 2)
				.startAngle(0)
				.endAngle(function(d) {
					return (d.denom ? (2 * Math.PI) * (d.numer / d.denom) : 0);
				});


		function Stats(selection) {
			svg = d3.select(selection);
			console.log(data);
			g = svg.append("g").classed("stats", true)
				.datum(data)
				.attr("transform", "translate(" + ((size + padding) * data.order + arcSize) + ", " + arcSize + ")");
			// background circle
			g.append("circle")
				.attr("cx", size / 2)
				.attr("cy", size / 2)
				.attr("r", size / 2)
				.attr("fill", app.colors[data.key])
				.attr("opacity", .2);

			arcPath = g.append("path")
				.attr("d", arc)
				.attr("transform", "translate(" + size / 2 + ", " + size / 2 + ")")
				.attr("fill", app.colors[data.key]);

			numerText = g.append("text")
				.classed("numerator", true)
				.attr("x", size / 2)
				.attr("y", size / 2)
				.attr("text-anchor", "middle")
				.style("font-size", size / 2 + "px")
				.attr("fill", "#657b83")
				.style("font-weight", 200)
				.text(data.numer);

			denomText = g.append("text")
				.classed("denominator", true)
				.attr("x", size / 2)
				.attr("y", size / 6 * 5)
				.attr("text-anchor", "middle")
				.style("font-size", size / 8 + "px")
				.attr("fill", "#657b83")
				.text((data.denom ? data.denom : ""));

			g.append("text")
				.classed("type", true)
				.attr("x", size / 2)
				.attr("y", size / 4 * 5)
				.attr("text-anchor", "middle")
				.style("font-size", size / 8 + "px")
				.attr("fill", "#657b83")
				.text(convertKeys[data.key]);


		}

		Stats.update = function() {
			arcPath.transition().duration(750)
				.attr("d", arc);
			numerText.text(data.numer);
			denomText.text(data.denom);

		}

    /* getter/setters */
    Stats.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        return Stats;
    }

		return Stats;
	}
});