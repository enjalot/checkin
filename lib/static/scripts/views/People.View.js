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

			return this;
		},
		renderFace: function() {
			var that = this,
				data = this.chart.data();

			data.id = this.model.cid;
			data.name = this.model.get("name");
			data.url = this.model.get("avatar");
			data.arcs = [];
			this.model.get("memberId") ? data.arcs.push("member") : data.arcs.push("guest");
			this.model.get("response") === "waitlist" ? data.arcs.push("waitlist") : data.arcs.push(this.model.get("response"));
			this.model.get("checkin") !== "no" ? data.arcs.push("checkin") : null;

			// load names and arcs before images
			this.chart(that.$("svg")[0]);

			// fill in avatar image when dimensions are gotten
			$("<img />").attr("src", data.url)
				.load(function() {
					if (this.width < this.height) {
						data.width = app.faceSize;
						data.height = (app.faceSize / this.width) * this.height;
					} else {
						data.height = app.faceSize;
						data.width = (app.faceSize / this.height) * this.width;
					}
					that.chart.updateImage();
				})
		},
		updateFace: function() {
			var data = this.chart.data();
			data.arcs = [];
			this.model.get("memberId") ? data.arcs.push("member") : data.arcs.push("guest");
			this.model.get("response") === "waitlist" ? data.arcs.push("waitlist") : data.arcs.push(this.model.get("response"));
			this.model.get("checkin") !== "no" ? data.arcs.push("checkin") : null;

			this.chart.update();

		},
		events: {
			"click": "checkin"
		},
		checkin: function() {
			if (this.model.get("checkin") !== "no") {
				this.model.set("checkin", "no");
			} else {
				this.model.set("checkin", +new Date());
			}
			this.$el.trigger("updateStats", this.model);
			this.model.save();
		},
		show: function() {
			this.$el.show();
		},
		hide: function() {
			this.$el.hide();
		}
	});
});