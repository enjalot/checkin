require.config({
	baseUrl: "/static/scripts/contrib/",
	paths: {
		"app": "..",
		"underscore": "underscore",
		"backbone": "backbone",
		"bootstrap": "bootstrap",
		"d3": "d3.v3"
	},
	shim: {
		"underscore": {
			exports: "_"
		},
		"backbone": {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		"d3": {
			exports: "d3"
		}
	}
});

require([
	"jquery",
	"underscore",
	"backbone",
	"app/views/App.View"
], function(
	$,
	_,
	Backbone,
	AppView
) {
	app = {};
	app.faceSize = 65;
	app.colors = {member: "#6c71c4", guest: "#859900", yes: "#268bd2", no: "#dc322f", waitlist: "#b58900", checkin: "#2aa198"};
	app.groupId = $(".content").attr("data-groupId");
	app.eventId = $(".content").attr("data-eventId");
	var appView = new AppView();
	appView.render();
});
