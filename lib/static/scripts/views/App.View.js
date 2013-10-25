define([
	"jquery",
	"underscore",
	"backbone",
	"app/collections/Peoples.Collection",
	"app/views/Peoples.View",
	"app/views/AddPerson.View",
	"app/visualizations/Stats.Visualization",
	"bootstrap"
], function(
	$,
	_,
	Backbone,
	PeoplesCollection,
	PeoplesView,
	AddPersonView,
	StatsVisualization
) {
	return Backbone.View.extend({
		el: "body",
		initialize: function() {
			this.peoplesView = new PeoplesView({collection: new PeoplesCollection()});
			this.addPersonView = new AddPersonView({collection: this.peoplesView.collection});
			this.stats = {};

			this.peoplesView.collection.on("reset", _.bind(this.renderStats, this));
		},
		render: function() {
			this.renderPeople();
			this.renderAddModal();

			$("#searchbar input").keyup(_.throttle(_.bind(this.keyup, this), 250));
		},
		/*
		populate the #people container
		*/
		renderPeople: function() {
			this.peoplesView.collection.fetch();
		},
		renderAddModal: function() {
			this.$el.append(this.addPersonView.render().el);
		},
		renderStats: function() {
			var denom = this.peoplesView.collection.getStats(),
				numer = this.peoplesView.collection.getCheckins(),
				i = 0,
				that = this;

			_.each(denom, function(val, key) {
				var data = {},
					stats = new StatsVisualization();
				data.order = i;
				data.key = key;
				data.numer = (numer[key] ? numer[key] : 0);
				data.denom = val;
				// data.push(obj)

				stats.data(data);
				stats(that.$("#stats")[0]);
				that.stats[key] = stats;
				i += 1;
			});
		},
		updateStats: function(e, model) {
			var stats = this.stats[model.get("response")];
			if (model.get("checkin") !== "no") {
				stats.data().numer += 1;
			} else {
				stats.data().numer -= 1;
			}
			stats.update();
		},
		events: {
			"updateStats .people": "updateStats",
			// "checkedin .people": "checkedin",
			// "checkedout .people": "endSearch",
			"focus #searchbar input": "focus",
			// "blur #searchbar input": "blur",
			// "keyup #searchbar input": "keyup"
			// "hidden .checkinSuccess": "endSearch",
			// "click .add": "showAddModal"
		},
		focus: function(e) {
			$(".people").hide();
			$(e.target).animate({
				width: "756px"
			}, 250, function() {
				$(".add").show();
			});
		},
		blur: function(e) {
			$(".people").show();
			$(".add").hide();
			$(e.target).animate({
				width: "816px"
			}, 250);
			$(e.target).val("");
		},
		keyup: function(e) {
			var val = $(e.target).val(),
				key = e.which,
				ESC_KEY = 27;

			if (key === ESC_KEY) {
				$(e.target).blur();
			} else {
				this.peoplesView.filterBySearch(val);
				// this.showAddButton();
				// this.$("#searchbar").addClass("input-append");
			}
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