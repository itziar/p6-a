// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".
 
Players = new Meteor.Collection("players");
 
Players.reset = function (names) {
	if (!names) {
		names = _.pluck(Players.find().fetch(), 'name');
	}
	for (var i = 0; i < names.length; i++)
		Players.update({'name': names[i] }, { $set: { score: Math.floor(Math.random()*10)*5}});
	};
 

Players.addPlayer = function (name) {
	return Players.insert({name: name, score: Math.floor(Math.random()*10)*5 });
};
 
if (Meteor.isClient) {
	Template.leaderboard.players = function () {
	var sortBy = Session.get('sortBy');
	var sort = {};
	// Hack to set entire object
	if (sortBy === 'name') {
		sort = { name: 1, score: -1 };
	} else if (sortBy === 'score') {
		sort = { score: -1, name: 1 };
	}
	return Players.find({}, {sort: sort});
	};
 
	Template.leaderboard.sortBy = [
		{ value: "name"  }, 
		{ value: "score" }
	];
 
	Template.leaderboard.currentSortBy = function () {
		return Session.get("sortBy");
	};
 
	Template.leaderboard.selectedSortBy = function () {
		return Session.equals("sortBy", this.value) ? "selected" : '';
	};
 
	Template.leaderboard.selected_name = function () {
		var player = Players.findOne(Session.get("selected_player"));
		return player && player.name;
	};
 
	Template.player.selected = function () {
		return Session.equals("selected_player", this._id) ? "selected" : '';
	};
 
	Template.leaderboard.events({
		'click input.inc': function () {
			Players.update(Session.get("selected_player"), {$inc: {score: 5}});
		},
		'click input.reset': function () {
			Players.reset();
		},
		'click input.add': function () {
			var name = document.getElementById('add-player-name').value;
			Players.addPlayer(name);
	  		document.getElementById('add-player-name').value = '';
		},
		'click .sortBy': function () {
			Session.set('sortBy', this.value);
		}
	});
 
	Template.player.events({
		'click': function () {
			Session.set("selected_player", this._id);
		},
		'click .remove': function () {
			Players.remove({ _id: this._id });
		}
	});
 
	Session.get("sortBy") || Session.set('sortBy', 'score');
}
 
// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function () {
		if (Players.find().count() === 0) {
			var names = ["Ada Lovelace",
						"Grace Hopper",
						"Marie Curie",
						"Carl Friedrich Gauss",
						"Nikola Tesla",
						"Claude Shannon"];
			for (var i = 0; i < names.length; i++) {
				Players.insert({name: names[i]});
			}
			Players.reset(names);
		}
	});
}
