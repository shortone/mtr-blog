// --
// Constants
var SHOW_ADD_SPEAKERS = "showAddSpeakers";
var SHOW_REPLY = "showReply";
// --

var Discussions = new Mongo.Collection("discussions");
var Messages = new Mongo.Collection("messages");

function handleToggle(sessionKey, id) {
  var arr = Session.get(sessionKey);
  if (_.contains(arr, id)) {
    // remove id from the list
    arr = _.without(arr, id);
  } else {
    arr.push(id);
  }
  // persist the array in the session
  Session.set(sessionKey, arr);
}

if (Meteor.isClient) {
  Session.set(SHOW_ADD_SPEAKERS, new Array());
  Session.set(SHOW_REPLY, new Array());

  Template.body.helpers({
    discussions: function() {
      return Discussions.find({speakers: Meteor.user().username});
    }
  });

  Template.body.events({
    "submit .create-discussion": function(event) {
      var speakers = event.target.speakers.value;
      var content = event.target.content.value;
      var author = Meteor.user().username;

      Discussions.insert({
        speakers: new Array(author, speakers),
        createAt: new Date()
      }, function(err, id) {
        if (! err) {
          Messages.insert({
            author: author,
            content: content,
            createdAt: new Date(),
            discussion: id
          });
        }
      });

      event.target.speakers.value = "";
      event.target.content.value = "";

      return false;
    }
  });

  Template.discussion.helpers({
    messages: function() {
      return Messages.find({discussion: this._id});
    },
    showAddSpeakersForm: function() {
      var arr = Session.get(SHOW_ADD_SPEAKERS);
      return _.contains(arr, this._id);
    },
    showReplyForm: function() {
      var arr = Session.get(SHOW_REPLY);
      return _.contains(arr, this._id);
    }
  });

  Template.discussion.events({
    "submit .reply": function(event) {
      var content = event.target.content.value;

      Messages.insert({
        author: "shortone@dictive.ch",
        content: content,
        createdAt: new Date(),
        discussion: this._id
      });

      event.target.content.value = "";

      return false;
    },
    "submit .add-speakers": function(event) {
      var speaker = event.target.speakers.value;

      Discussions.update(this._id, {$push: {speakers: speaker}});

      event.target.speakers.value = "";

      return false;
    },
    "click .show-add-speakers-form": function() {
      handleToggle(SHOW_ADD_SPEAKERS, this._id);
    },
    "click .show-reply-form": function() {
      handleToggle(SHOW_REPLY, this._id);
    },
    "click .remove-discussion": function() {
      console.log("Removing discussion " + this._id + "... or not!");
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
