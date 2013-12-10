define([
	"jquery",
	"underscore",
	"backbone",
	"app/views/People.View",
	"app/collections/Peoples.Collection"
], function(
	$,
	_,
	Backbone,
	PeopleView,
	PeoplesCollection
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
			this.collection.chain()
				.filter(function(model) {
					return model.get("response") === "yes"
						|| model.get("response") === "waitlist";
				}).each(function(model) {
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
		emptyPeople: function() {
			this.$el.empty();
		},
		filterBySearch: function(val) {
			var regex = new RegExp(val, "gi"),
				that = this;
			this.collection.each(function(model) {
				if (model.get("name").match(regex)) {
					if (model.get("response") === "no"
						&& !model.view) {
						that.addPerson(model);
					}
					model.view.show();
				} else {
					if (model.get("response") === "no"
						&& model.get("checkin") === "no"
						&& model.view) {
						model.view.remove();
						model.view = undefined;
					} else if (model.view) {
						model.view.hide();
					}
				}
			});
		}
	});
});