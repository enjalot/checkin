define([
	"jquery",
	"underscore",
	"backbone",
	"app/models/People.Model"
], function(
	$,
	_,
	Backbone,
	PeopleModel
) {
	/*
	collection of all people, including members and nonmembers.
	*/
	return Backbone.Collection.extend({
		model: PeopleModel,
		url: function() {
			return "/api/rsvps/" + app.groupId + "/" + app.eventId;
		},
		initialize: function() {
			// this.on("reset", _.bind(this.subscribeToChange, this));
			// this.on("add", _.bind(this.subscribeToChange, this));
		},
		/*
		fetch: temporary function that joins data/members.json and data/events.json
		once the backend is in place, this function will be replaced with a url function 
		for one AJAX call to the backend.
		*/
		// fetch: function() {
		// 	var that = this;
		// 	$.get("/static/data/rsvps.json", function(members) {
		// 		that.reset(members);
		// 	});
		// },
		parse: function(results) {
			this.reset(results);
		},
		comparator: function(model) {
			return model.get("name");
		},
		getStats: function() {
			return _.countBy(this.models, function(model) {
				return model.get("response");
			});
		},
		getCheckins: function() {
			var count = _.chain(this.models)
				.filter(function(model) {
					console.log(model.get("checkin"));
					return model.get("checkin") !== "no";
				}).countBy(function(model) {
					return model.get("response");
				}).value();
			count.guest = _.filter(this.models, function(model) {
				return !model.get("memberId");
			}).length;
			count.checkin = _.filter(this.models, function(model) {
				return model.get("checkin") !== "no";
			}).length;

			return count;
		},
		// subscribeToChange: function() {
		// 	var that = this;
		// 	this.each(function(model) {
		// 		model.on("change", function() {
		// 			that.trigger("change", model);
		// 		});
		// 	});
		// }
	});
});
