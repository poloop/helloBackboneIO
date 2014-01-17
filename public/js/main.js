/**
 * Created by plong on 14/01/14.
 */
Backbone.io.connect();

var helloBIO = helloBIO || {};

(function( $, helloBIO )
{
    /**
     * Document ready event
     * alias de $(document).ready( function(){} );
     */
    $( function ()
    {
        console.log("INIT");

        helloBIO.models = helloBIO.models || {};

        helloBIO.models.ContactModel = Backbone.Model.extend
        (
            {
                idAttribute: "_id",

                defaults :
                {
                    nom: "",
                    prenom: ""
                },

                initialize: function() {
                    this.on('error', function(model, res) {
                        alert(res.error.message);
                    });
                }
            }
        );

        helloBIO.models.ContactsCollection = Backbone.Collection.extend({
            backend: 'contacts',

            model: helloBIO.models.ContactModel,

            initialize: function() {
                console.log("ContactsCollection");
                var self = this;
                this.bind('backend', function(method, model) {
                    console.log("bind");
                });
                this.bind('backend:create', function(model) {
                    console.log("bind create");
                    self.add(model);
                });
                this.bind('backend:update', function(model) {
                    self.get(model.id).set(model);
                });
                this.bind('backend:delete', function(model) {
                    self.remove(model.id);
                });
            }
        });

        helloBIO.views = helloBIO.views || {};

        helloBIO.views.AddContactView = Backbone.View.extend({
            events: {
                'click [type="button"]': 'addContact'
            },

            initialize: function(options) {
                console.log("addContactView");
                this.template = _.template($('#addContact').html());
            },

            addContact: function() {
                console.log("AddContact");
                var contact = new helloBIO.models.ContactModel({ nom : this.$('#nomContact').val(), prenom : this.$('#prenomContact').val()});
                this.collection.create(contact);
            }
        });

        helloBIO.views.ContactView = Backbone.View.extend({

            tagName: 'li',

            events: {
                'click .delete': 'delete'
            },

            initialize: function() {
                console.log("ContactView");
                this.template = _.template("<li><%= prenom %> <%= nom %> <a class='delete' href='#'>[x]</a></li>");
            },

            render: function() {
                $(this.el).html(this.template(this.model.toJSON()));
                return this;
            },

            delete: function(e) {
                e.preventDefault();
                this.model.destroy();
            }

        });

        helloBIO.views.ContactsView = Backbone.View.extend({


            initialize: function(options) {
                console.log("ContactsView");
                this.collection.on('add change remove reset', this.render, this);
                this.template = _.template($('#contactsList').html());
            },

            render: function() {
                $(this.el).html(this.template());

                this.collection.each(function(contact) {
                    var contactView = new helloBIO.views.ContactView({ model: contact });
                    this.$('ul').append(contactView.render().el);
                });

                return this;
            }
        });


        helloBIO.contacts = new helloBIO.models.ContactsCollection();
        helloBIO.contacts.fetch();
        new helloBIO.views.AddContactView({ el: $('#addContact'), collection: helloBIO.contacts });
        new helloBIO.views.ContactsView({ el: $('#contactsList'), collection: helloBIO.contacts });
    });
})(Zepto, helloBIO);