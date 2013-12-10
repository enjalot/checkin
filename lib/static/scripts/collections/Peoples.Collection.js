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
		}
	});
});
