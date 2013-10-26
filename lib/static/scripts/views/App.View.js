define([
	"jquery",
	"underscore",
	"backbone",
	"app/collections/Peoples.Collection",
	"app/views/Peoples.View",
	// "app/views/AddPerson.View",
	"app/visualizations/Stats.Visualization",
	"bootstrap"
], function(
	$,
	_,
	Backbone,
	PeoplesCollection,
	PeoplesView,
	// AddPersonView,
	StatsVisualization
) {
	return Backbone.View.extend({
		el: "body",
		initialize: function() {
			this.peoplesView = new PeoplesView({collection: new PeoplesCollection()});
			// this.addPersonView = new AddPersonView({collection: this.peoplesView.collection});
			this.stats = {};

			this.peoplesView.collection.on("reset", _.bind(this.renderStats, this));
		},
		render: function() {
			this.renderPeople();

			$("#searchbar input").keyup(_.throttle(_.bind(this.keyup, this), 250));
		},
		/*
		populate the #people container
		*/
		renderPeople: function() {
			this.peoplesView.collection.fetch();
		},
		// renderAddModal: function() {
		// 	this.$el.append(this.addPersonView.render().el);
		// },
		renderStats: function() {
			var denom = this.peoplesView.collection.getStats(),
				numer = this.peoplesView.collection.getCheckins(),
				join = _.union(_.keys(denom), _.keys(numer)),
				// i = 0,
				that = this;

			_.each(join, function(key, i) {
				var data = {},
					stats = new StatsVisualization();
				data.order = i;
				data.key = key;
				data.numer = (numer[key] ? numer[key] : 0);
				data.denom = (denom[key] ? denom[key] : null);
				// data.push(obj)

				stats.data(data);
				stats(that.$("#stats")[0]);
				that.stats[key] = stats;
				// i += 1;
			});
		},
		updateStats: function(e, model) {
			var stats = this.stats[model.get("response")],
				checkin = this.stats["checkin"],
				guest = this.stats["guest"];
			if (model.get("checkin") !== "no") {
				stats.data().numer += 1;
				checkin.data().numer += 1;
				if (!model.get("memberId")) {
					guest.data().numer += 1;
					stats.data().denom += 1;
				};
			} else {
				stats.data().numer -= 1;
				checkin.data().numer -= 1;
				if (!model.get("memberId")) {
					guest.data().numer -= 1;
					stats.data().denom -= 1;
				};
			}
			stats.update();
			checkin.update();
			guest.update();
			this.refocus();
			// _.delay(this.blur, 250);
			// this.blur(); // better feedback needed...
		},
		events: {
			"click .focusout": "blur",
			"updateStats .people": "updateStats",
			// "checkedin .people": "checkedin",
			// "checkedout .people": "endSearch",
			"focus input.search": "focus",
			// "blur #searchbar input": "blur",
			// "keyup #searchbar input": "keyup"
			// "hidden .checkinSuccess": "endSearch",
			"click .add": "addPerson"
		},
		focus: function(e) {
			// $(".people").hide();
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
			$(".people").show();
			$(".add").hide();
			$("input.search").animate({
				width: "816px"
			}, 250);
			$("input.search").val("");
			$("input.search").blur();
		},
		keyup: function(e) {
			var val = $(e.target).val(),
				key = e.which,
				ESC_KEY = 27,
				ETR_KEY = 13;

			if (key === ESC_KEY) {
				this.blur();
			} else if (key === ETR_KEY) {
				this.addPerson();
			} else {
				this.peoplesView.filterBySearch(val);
				// this.showAddButton();
				// this.$("#searchbar").addClass("input-append");
			}
		},
		addPerson: function() {
			var name = $("input.search").val();
			this.peoplesView.collection.add({name: name});
		}
		// checkedin: function() {
			// this.$(".checkinSuccess").modal("show");
			// this.renderStats();
		// },
		// keyup: function(e) {
		// 	var val = $(e.target).val(),
		// 		key = e.which,
		// 		ESC_KEY = 27;

		// 	if (key === ESC_KEY) {
		// 		$(e.target).blur();
		// 	} else {
		// 		this.peoplesView.filterBySearch(val);
		// 		this.showAddButton();
		// 		this.$("#searchbar").addClass("input-append");
		// 	}

		// },
		// showAddModal: function() {
		// 	this.addPersonView.show();
		// },
		// addPerson: function() {
		// 	var name = this.$("input.search").val(),
		// 		data = {name: name, member: "no"};
		// 	this.peoplesView.collection.add(data);

		// 	this.endSearch();
		// },
		// showAddButton: function(e) {
		// 	this.$(".add").show();
		// },
		// hideAddButton: function(e) {
		// 	this.$(".add").hide();
		// },
		// endSearch: function(e) {
		// 	this.$("#searchbar input").val("");
		// 	this.peoplesView.endSearch();

		// 	this.$("#searchbar").removeClass("input-append");
		// 	this.hideAddButton();
		// }
	});
});