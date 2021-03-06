define([
	"jquery",
	"underscore",
	"backbone",
	"app/collections/Peoples.Collection",
	"app/views/Peoples.View",
	"app/visualizations/Stats.Visualization",
	"bootstrap"
], function(
	$,
	_,
	Backbone,
	PeoplesCollection,
	PeoplesView,
	StatsVisualization
) {
	return Backbone.View.extend({
		el: "body",
		initialize: function() {
			this.peoplesView = new PeoplesView({collection: new PeoplesCollection()});
			this.stats = {};

			this.peoplesView.collection.on("reset", _.bind(this.renderStats, this));
		},
		render: function() {
			this.renderPeople();

			$("#searchbar input").keyup(_.throttle(_.bind(this.keyup, this), 500));
			$(window).scroll(_.throttle(_.bind(this.scroll, this), 200));
		},
		/*
		populate the #people container
		*/
		renderPeople: function() {
			this.peoplesView.collection.fetch({reset: true});
		},
		renderStats: function() {
			var denom = this.peoplesView.collection.getStats(),
				numer = this.peoplesView.collection.getCheckins(),
				join = _.union(_.keys(denom), _.keys(numer)),
				that = this;

			_.each(join, function(key, i) {
				var data = {},
					stats = new StatsVisualization();
				data.order = i;
				data.key = key;
				data.numer = (numer[key] ? numer[key] : 0);
				data.denom = (denom[key] ? denom[key] : null);

				stats.data(data);
				stats(that.$("#stats")[0]);
				that.stats[key] = stats;
			});
		},
		updateStats: function(e, model) {
			var stats = this.stats[model.get("response")],
				checkin = this.stats["checkin"],
				guest = this.stats["guest"];
			if (model.get("checkin") !== "no") {
				stats.data().numer += 1;
				checkin.data().numer += 1;
				if (model.get("isGuest")) {
					guest.data().numer += 1;
				};
			} else {
				stats.data().numer -= 1;
				checkin.data().numer -= 1;
				if (model.get("isGuest")) {
					guest.data().numer -= 1;
				};
			}
			stats.update();
			checkin.update();
			guest.update();
			this.refocus();
		},
		events: {
			"click .focusout": "blur",
			"updateStats .people": "updateStats",
			"focus input.search": "focus",
			"click .add": "addPerson",
			"unselect g[class~=stats]": "hidePeople"
		},
		focus: function(e) {
			$(e.target).animate({
				width: "756px"
			}, 250, function() {
				$(".add").show();
			});
		},
		refocus: function() {
			$("input.search").val("");
			$("input.search").focus();
		},
		blur: function(e) {
			this.hidePeople();
			this.blurInput();
		},
		blurInput: function(e) {
			$(".add").hide();
			$("input.search").animate({
				width: "816px"
			}, 250);
			$("input.search").val("");
			$("input.search").blur();
		},
		hidePeople: function() {
			$(".noRSVP.noCheckin").hide();
			$(".yesCheckin").show();
			$(".yesRSVP").show();
			$(".waitlistRSVP").show();
		},
		keyup: function(e) {
			var val = $(e.target).val(),
				key = e.which,
				ESC_KEY = 27,
				ETR_KEY = 13;

			if (key === ESC_KEY) {
				this.blur(e);
			} else if (key === ETR_KEY) {
				this.addPerson();
			} else {
				this.peoplesView.filterBySearch(val);
			}
		},
		scroll: function() {
			var top = $(window).scrollTop();
			if (top > app.stats) {
				$(".header").addClass("fixed");
				$("g.compressed").show();
			} else {
				$(".header").removeClass("fixed");
				$("g.compressed").hide();
			}
		},
		addPerson: function() {
			var name = $("input.search").val();
			this.peoplesView.collection.add({
				name: name, 
				checkin: +new Date(),
				isGuest: true
			});
		}
	});
});