define([
	"jquery",
	"underscore",
	"backbone",
	"text!app/templates/People.Template.html",
	"app/visualizations/People.Visualization"
], function(
	$,
	_,
	Backbone,
	PeopleTemplate,
	PeopleVisualization
) {
	return Backbone.View.extend({
		tagName: "span",
		className: "people",
		initialize: function() {
			this.model = this.options.model;
			this.chart = new PeopleVisualization();

			this.model.on("change:checkin", _.bind(this.updateFace, this));
			this.model.on("change:show", _.bind(this.render, this));
		},
		render: function() {
			this.$el.html(_.template(PeopleTemplate, this.model.attributes));
			this.renderFace();

			// this.shouldHide();
			// this.isMember();
			return this;
		},
		renderFace: function() {
			var that = this,
				data = {};

			data.name = this.model.get("name");
			data.url = this.model.get("avatar");
			data.arcs = [];
			this.model.get("memberId") ? data.arcs.push("member") : null;
			if (this.model.get("response") === "yes") {
				data.arcs.push("rsvp");
			} else if (this.model.get("response") === "waitlist") {
				data.arcs.push("waitlist");
			}
			this.model.get("checkin") !== "no" ? data.arcs.push("checkin") : null;

			$("<img />").attr("src", data.url)
				.load(function() {
					if (this.width < this.height) {
						data.width = app.faceSize;
						data.height = (app.faceSize / this.width) * this.height;
					} else {
						data.height = app.faceSize;
						data.width = (app.faceSize / this.height) * this.width;
					}

					that.chart.data(data);
					that.chart(that.$("svg")[0]);
				})
		},
		updateFace: function() {
			var data = this.chart.data();
			data.arcs = [];
			this.model.get("memberId") ? data.arcs.push("member") : null;
			if (this.model.get("response") === "yes") {
				data.arcs.push("rsvp");
			} else if (this.model.get("response") === "waitlist") {
				data.arcs.push("waitlist");
			}
			this.model.get("checkin") !== "no" ? data.arcs.push("checkin") : null;

			this.chart.update();

		},
		/*
		if model says to hide, hide the element.  else show.
		*/
		// shouldHide: function() {
		// 	if (this.model.get("show") === "no") {
		// 		this.$el.removeClass("yesshow");
		// 		this.hide();
		// 	} else {
		// 		this.$el.addClass("yesshow");
		// 		this.show();
		// 	}
		// },
		// isMember: function() {
		// 	if (this.model.get("member") === "yes") {
		// 		this.$el.addClass("member");
		// 	} else {
		// 		this.$el.removeClass("member");
		// 	}
		// },
		// /*
		// make the pictures a perfect square (not working)
		// */
		// makeSquare: function() {
		// 	var $img = this.$(".memberImg img");
		// 	if ($img.height() > $img.width()) {
		// 		$img.height(50);
		// 	} else {
		// 		$img.width(50);
		// 	}
		// },
		events: {
			"click": "checkin"
		},
		checkin: function() {
			if (this.model.get("checkin") !== "no") {
				this.model.set("checkin", "no");
			} else {
				this.model.set("checkin", new Date());
			}
			this.$el.trigger("updateStats", this.model);
		},
		// checkin: function() {
		// 	// toggle checkin
		// 	if (this.model.get("checkin") === "no") {
		// 		this.model.set("checkin", +new Date());
		// 		this.$el.trigger("checkedin");

		// 	} else {
		// 		this.model.set("checkin", "no");
		// 		this.$el.trigger("checkedout");
		// 	}
		// },
		show: function() {
			this.$el.show();
		},
		hide: function() {
			this.$el.hide();
		}
	});
});