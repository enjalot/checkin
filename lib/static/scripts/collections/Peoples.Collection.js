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
		/*
		fetch: temporary function that joins data/members.json and data/events.json
		once the backend is in place, this function will be replaced with a url function 
		for one AJAX call to the backend.
		*/
		fetch: function() {
			var that = this;
			$.get("/static/data/rsvps.json", function(members) {
				that.reset(members);
			});
		},
		comparator: function(model) {
			return model.get("name");
		}
	});
});
