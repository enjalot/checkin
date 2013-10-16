define([
	"jquery",
	"underscore",
	"backbone",
	"text!app/templates/AddPerson.Template.html",
	"bootstrap"
], function(
	$,
	_,
	Backbone,
	AddPersonTemplate
) {
	return Backbone.View.extend({
		className: "modal hide",
		initialize: function() {
			this.collection = this.options.collection;

			this.collection.on("reset", _.bind(this.render, this));
		},
		render: function() {
			this.$el.html(_.template(AddPersonTemplate, {collection: this.collection}));

			return this;
		},
		events: {
			
		},
		show: function() {
			this.$el.modal("show");
		}
	});
});