var app = app || {};

app.AppView = Backbone.View.extend({
    el: '#todoapp',

    statsTempalate: _.template($('#stats-template').html()),

    events: {
        "keypress #new-todo": "createOnEnter",
        "click #clear-completed": "clearCompleted",
        "click #toggle-all": "toggleAllComplete"
    },

    initialize: function () {
        this.allCheckbox = this.$('#toggle-all');
        this.$input = this.$('#new-todo');
        this.$footer = this.$('#footer');
        this.$main = this.$('#main');

        this.listenTo(app.Todos, 'add', this.addOne);
        this.listenTo(app.Todos, 'reset', this.addAll);

        this.listenTo(app.Todos, 'change:completed', this.filterOne);
        this.listenTo(app.Todos, 'filter', this.filterAll);
        this.listenTo(app.Todos, 'all', this.render);

        app.Todos.fetch();
    },

    addOne: function (todo) {
        debugger;
        var view = new app.TodoView({ model: todo });
        $('#todo-list').append(view.render().el);
    },

    addAll: function () {
        this.$('#todo-list').html();
        app.Todos.each(this.addOne, this);
    },

    render: function () {
        var completed = app.Todos.completed().length;
        var remaining = app.Todos.remaining().length;

        if (app.Todos.length) {
            this.$main.show();
            this.$footer.show();
            this.$footer.html(this.statsTempalate({
                completed: completed,
                remaining: remaining
            }));
            
            this.$('#filters li a')
            .removeClass('selected')
            .filter('[href="#/' + (app.TodoFilter || '') + '"]')
            .addClass('selected');
        } else {
            this.$main.hide();
            this.$footer.hide();
        }
        
        this.allCheckbox.checked = !remaining;
    },

    filterOne: function (todo) {
        todo.trigger('visible');
    },

    filterAll: function () {
        app.Todos.each(this.filterOne, this);
    },

    newAttributes: function () {
        return {
            title: this.$input.val().trim(),
            order: app.Todos.nextOrder(),
            completed: false
        };
    },

    createOnEnter: function (event) {
        if (event.which !== ENTER_KEY || !this.$input.val().trim()) {
            return;
        }
        app.Todos.add({ title: this.$input.val() });
        this.$input.val('');
    },

    clearCompleted: function () {
        _.invoke(app.Todos.completed(), 'destroy');
        return false;
    },

    toggleAllComplete: function () {
        var completed = this.allCheckbox.checked;
        app.Todos.each(function (todo) {
            todo.save({
                'completed': completed
            });
        });
    }
});
