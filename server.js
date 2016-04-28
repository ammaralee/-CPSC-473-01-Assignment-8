// Server-Side code

var express = require("express"),
    http = require("http"),
    // import the mongoose library
    mongoose = require("mongoose"),
    app = express();
    var Socket_Io=require("socket.io");

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

//  Mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);


var server = app.listen(3000);
var io = require('socket.io').listen(server);
console.log('Listening at localhost:3000');


io.on('connection', function (socket) {
    console.log('new user');
    socket.on("add", function(data) {
        io.sockets.emit("newToDO", data);
    });
});

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

app.post("/todos", function (req, res) {
    console.log(req.body);
    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
    newToDo.save(function (err, result) {
	if (err !== null) {
	    // the element did not get saved!
	    console.log(err);
	    res.send("ERROR");
	} else {
	    // client expects *all* of the todo items to be returned, so we'll do
	    // an additional request to maintain compatibility
	    ToDo.find({}, function (err, result) {
		if (err !== null) {
		    // the element did not get saved!
		    res.send("ERROR");
		}
		res.json(result);
	    });

	}
    });
});
