define([
	"jquery",
	"underscore",
	"backbone",
	"app/views/People.View"
], function(
	$,
	_,
	Backbone,
	PeopleView
) {
	/*
	view for #people
	this.collection: instance of PeoplesCollection
	*/
	return Backbone.View.extend({
		el: "#people",
		initialize: function() {
			this.collection = this.options.collection;

			this.collection.on("reset", _.bind(this.renderPeople, this));
			this.collection.on("add", _.bind(this.addPerson, this));
		},
		renderPeople: function() {
			var view,
				that = this;
			this.collection.each(function(model) {
				that.addPerson(model);
			});
		},
		addPerson: function(model) {
			var view = new PeopleView({model: model});
			this.$el.append(view.render().el);

			model.view = view;

			// if i'm adding a non-member, they must be checking in
			// so trigger "click" on the view and check them in
			if (!model.get("memberId")) {
				view.checkin();
			}
		},
		filterBySearch: function(val) {
			this.$(".people").addClass("hideView");
			var regex = new RegExp(val, "gi");
			this.collection.each(function(model) {
				if (regex.test(model.get("name"))) {
					model.view.show();
				}
			});
		},
		endSearch: function() {
			this.$(".people").addClass("hideView");
			this.$(".people.yesshow").removeClass("hideView");
		}
	});
});