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
		comparator: function(model) {
			return model.get("name").toLowerCase();
		},
		getStats: function() {
			var count = _.countBy(this.models, function(model) {
				return model.get("response");
			});

			delete count.no;

			return count;
		},
		getCheckins: function() {
			var count = _.chain(this.models)
				.filter(function(model) {
					return model.get("checkin") !== "no";
				}).countBy(function(model) {
					return model.get("response");
				}).value();
			count.yes = count.yes || 0;
			count.no = count.no || 0;
			count.waitlist = count.waitlist || 0;
			count.guest = _.filter(this.models, function(model) {
				return model.get("isGuest");
			}).length;
			count.checkin = _.filter(this.models, function(model) {
				return model.get("checkin") !== "no";
			}).length;

			return count;
		}
	});
});
