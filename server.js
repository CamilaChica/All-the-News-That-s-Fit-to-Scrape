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
    articles.find({}, null, {sort: {created: -1}}, function(err, data){
            if (data.length === 0){
                res.render("placeholder", {message: "There is not article founded yet, click the buttom to choose any article"});
            }
            else {
                res.render("index", {articles: data})
            }
    });
});

app.get("/:id", function(req, res){
    articles.findById(req.params.id, function(err, data){
        res.json(data);
    })
})

app.get("/saved", function(req, res){
    articles.find({saved: true}, null, {sort: {created: -1}}, function(err, data){
            if(data.length === 0){
                res.render("placeholder", {message: "You have not saved any articles"})
            }
            else {
                res.render("saved", {saved: data});
            }
    })
})

app.post("/save/:id", function(req, res){
    articles.findById(req.params.id, function(err, data){
        if(data.saved){
            articles.findByIdAndUpdate(req.params.id, {$set: {saved: false, status: "Save article"}}, {new: true}, function(err, data){
                res.redirect("/");
            })
        }
        else {
            articles.findByIdAndUpdate(req.params.id, {$set: {saved: true, status: "Article is already saved"}}, {new: true}, function(err, data){
                res.redirect("/saved", {saved: data});
        })
    }
    })
});
app.post("/search", function(req, res){
    //console.log(req.body.search);
    articles.find({$text: {$search: req.body.search, $caseSensative: false}}, null, {sort: {created: -1}}, function(err, data){
        if(data.length === 0){
            res.render("placeholder", {message: "You have not saved any articles"})
        }
        else {
            res.render("search", {saved: data});
        }
    });
});

app.get("/note/:id", function(req, res){
    var id = req.params.id;
    articles.findById(id).populate("note").exec(function(err, data){
            res.send(data.notes);
    });
});

app.post("/note/:id", function(req, res){
    var tempNote = new notes(req.body);
    notes.saved(function(err, doc){
        if(err) throw err;
        articles.findByIdAndUpdate(req.params.id, {$set: {"note": doc._id}}, {new: true}, function(err, res1){
            if(err) throw err;
            else{
                res.send(res1);
            }
        });
    });
});