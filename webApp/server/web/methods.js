Meteor.methods({

	'counters.insert': function(opts) {

		var role = opts.roles[0];
		var mail = opts.emails[0].address;
		var pass = '123456b:'

		var id = Accounts.createUser({
			username: opts.username,
			email: mail,
			password: pass
		});

		if (opts.roles.length > 0) {
			Roles.addUsersToRoles(id, role);
		};

	},

	'paths.addClock': function (pathId, clockId) {
		check(pathId, String);
		check(clockId, String);
		var loggedInUser = Meteor.user();
		if (!loggedInUser) {
			throw new Meteor.Error("not-logged-in", "You must be logged in for this action!");
		} else { 
			Paths.update(pathId, { $addToSet: {
		 		clocks: clockId
			}});
		}
	},
	
	'paths.removeClock': function (pathId, clockId) {
		check(pathId, String);
		check(clockId, String);
		var loggedInUser = Meteor.user();
		if (!loggedInUser) {
			throw new Meteor.Error("not-logged-in", "You must be logged in for this action!");
		} else { 
			Paths.update(pathId, { $pull: { clocks: clockId }});
		}
	},

	'clocks.delete' : function (clockId) {
		check(clockId, String);
		var pth = Paths.findOne({clocks: clockId});
		if (pth) {
			var pathId = pth._id;
			Paths.update(pathId, { $pull: { clocks: clockId }});
		}
		return Clocks.remove(clockId);
	},

	'comments.delete' : function (commentId) {
		return Comments.remove(commentId);
	}

});




