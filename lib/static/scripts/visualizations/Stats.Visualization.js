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
	},
	convertStats = {
		"yes": "yesRSVP",
		"no": "noRSVP",
		"waitlist": "waitlistRSVP",
		"checkin": "yesCheckin",
		"guest": "guest"
	}
	return function() {
		var data, svg, g, circle, arcPath, numerText, 
			denomText, compressed, numer, compressedText,
			size = 135,
			padding = 25,
			arcSize = 5,
			width, height,
			arc = d3.svg.arc()
				.innerRadius((size / 2) - (arcSize / 2))
				.outerRadius(size / 2 + arcSize / 2)
				.startAngle(0)
				.endAngle(function(d) {
					return (d.denom ? (2 * Math.PI) * (d.numer / d.denom) : 0);
				});


		function Stats(selection) {
			svg = d3.select(selection);
			width = $(selection).width();
			height = $(selection).height();
			g = svg.append("g").classed("stats", true)
				.datum(data)
				.attr("transform", "translate(" + ((size + padding) * data.order + arcSize) + ", " + arcSize + ")")
				.on("click", function(d) {
					console.log(this, d.selected);
					if (d.selected) {
						$(this).trigger("unselect");
						Stats.unselect();
					} else {
						$(".people").hide();
						$("." + convertStats[d.key]).show();
						Stats.select();
					}
				});
			// background circle
			circle = g.append("circle")
				.attr("cx", size / 2)
				.attr("cy", size / 2)
				.attr("r", size / 2)
				.attr("fill", app.colors[data.key])
				.attr("opacity", .2);

			arcPath = g.append("path")
				.classed("arc", true)
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

			compressed = g.append("g").classed("compressed", true)
				.attr("transform", "translate(0, " + (height - 2 * arcSize) + ")");
			compressed.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", size)
				.attr("height", arcSize)
				.attr("opacity", .2)
				.attr("fill", app.colors[data.key]);

			if (data.denom) {
				numer = compressed.append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", (data.numer / data.denom) * size)
					.attr("height", arcSize)
					.attr("fill", app.colors[data.key]);
			}

			compressedText = compressed.append("text")
				.classed("compressedText", true)
				.attr("x", size / 2)
				.attr("y", -arcSize)
				.attr("text-anchor", "middle")
				.style("font-size", size / 8 + "px")
				.attr("fill", "#657b83")
				.text(function() {
					var str = data.numer;
					if (data.denom) {
						str += "/" + data.denom;
					}  
					str += " " + convertKeys[data.key];
					return str;
				});

			compressed.style("display", "none");
		}

		Stats.update = function() {
			arcPath.transition().duration(750)
				.attr("d", arc);
			numerText.text(data.numer);
			denomText.text(data.denom);

			if (numer) {
				numer.transition().duration(750)
					.attr("width", (data.numer / data.denom * size));
			}
			compressedText.text(function() {
				var str = data.numer;
				if (data.denom) {
					str += "/" + data.denom;
				}  
				str += " " + convertKeys[data.key];
				return str;
			});
		}

		Stats.select = function() {
			svg.selectAll("g.stats").each(function(d) {
				d.selected = false;
			});
			svg.selectAll("circle").attr("fill", app.colors.gray);
			svg.selectAll("path.arc").attr("fill", app.colors.gray);
			circle.attr("fill", app.colors[data.key]);
			arcPath.attr("fill", app.colors[data.key]);

			g.each(function(d) {
				d.selected = true;
			})
		}

		Stats.unselect = function() {
			svg.selectAll("g.stats").each(function(d) {
				d.selected = false;
			});
			svg.selectAll("circle").attr("fill", function(d) {
				return app.colors[d.key];
			});
			svg.selectAll("path.arc").attr("fill", function(d) {
				return app.colors[d.key];
			});
		}

    /* getter/setters */
    Stats.data = function(value) {
        if (!arguments.length) return data;
        data = value;
        data.selected = false;
        return Stats;
    }

		return Stats;
	}
});