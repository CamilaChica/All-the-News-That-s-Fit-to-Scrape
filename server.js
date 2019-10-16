var express = require ("express")
var method = require ("method-override")
var body = require ("body-parser")
var expressHandlebars  = require ("express-handlebars")
var mongoose = require ("mongoose")
var cheerio = require ("cheerio")
var request = require ("request")

var notes = require("./models/note.js")
var articles = require("./models/article.js")
var databaseUrl = 'mongodb://localhost/scrap';

if (process.env.MONGODB_URI){
    mongoose.connect(process.env.MONGODB_URI)
}
else{
    mongoose.connect(databaseUrl);
}

mongoose.Promise = Promise;

var database = mongoose.connection;

database.on("error",function(error){
    console.log("Oh no there's an error! ", error);
});

database.on("open", function(open){
    console.log("Yay we have connected!");
});

var app = express();
var port = process.env.port || 3030;

app.use(express.static("public"));
app.use(body.urlencoded({extended: false}));
app.use(method("_method"));
app.enable("handlebars", expressHandlebars({defaultLayout : "main"}));
app.set("view engine", "handlebars");

app.listen(port, function(){
        console.log("Yay we have connected to the server!");
});


app.get("/", function(req, res){
    articles.find({}, null)
});
