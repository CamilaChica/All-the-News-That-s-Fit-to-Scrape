var express = require ("express")
var method = require ("method-override")
var body = require ("body-parser")
var expressHandlebars  = require ("express-handlebars")
var mongoose = require ("mongoose")
var cheerio = require ("cheerio")
var request = require ("request")

var Note = require("./models/note.js")
var Article = require("./models/article.js")
var databaseUrl = process.env.MONGODB_URI || 'mongodb://localhost/scrap';

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
app.engine("handlebars", expressHandlebars({defaultLayout : "main"}));
app.set("view engine", "handlebars");

app.listen(port, function(){
        console.log("Yay we have connected to the server!");
});


app.get("/", function(req, res) {
	Article.find({}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("placeholder", {message: "There's nothing scraped yet. Please click \"Scrape For Newest Articles\" for fresh and delicious news."});
		}
		else{
			res.render("index", {articles: data});
		}
	});
});

app.get("/scrape", function(req, res) {
	request("https://www.skysports.com/football/news", function(error, response, html) {
		var $ = cheerio.load(html);
		//console.log(html);
		var result = {};
		$(".news-list__item").each(function(i, element) {
			var link = $(element).find("a.news-list__headline-link").attr("href");
			//console.log(link);
			var title = $(element).find("a.news-list__headline-link").text().trim();
			//console.log(title);
			var summary = $(element).find(".news-list__snippet").text().trim();
			//console.log(summary);
			var img = $(element).find("img.news-list__image").attr("data-src");
			//console.log(img);
			result.link = link;
			result.title = title;
			
			if (summary) {
				result.summary = summary;
			};
			if (img) {
				result.img = img;
			}
			else {
				result.img = $(element).find(".wide-thumb").find("img").attr("src");
			}; 
			var entry = new Article(result);
			Article.find({title: result.title}, function(err, data) {
				if (data.length === 0) {
					entry.save(function(err, data) {
						if (err) throw err;
					});
				}
			});
		});
		console.log("Scrape finished.");
		res.redirect("/");
	});
});





app.get("/saved", function(req, res) {
	Article.find({issaved: true}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("placeholder", {message: "You have not saved any articles yet. Try to save some delicious news by simply clicking \"Save Article\"!"});
		}
		else {
			res.render("saved", {saved: data});
		}
	});
});

app.get("/:id", function(req, res) {
	Article.findById(req.params.id, function(err, data) {
		res.json(data);
	})
})

app.post("/search", function(req, res) {
	console.log(req.body.search);
	Article.find({$text: {$search: req.body.search, $caseSensitive: false}}, null, {sort: {created: -1}}, function(err, data) {
		console.log(data);
		if (data.length === 0) {
			res.render("placeholder", {message: "Nothing has been found. Please try other keywords."});
		}
		else {
			res.render("search", {search: data})
		}
	})
});

app.post("/save/:id", function(req, res) {
	Article.findById(req.params.id, function(err, data) {
		if (data.issaved) {
			Article.findByIdAndUpdate(req.params.id, {$set: {issaved: false, status: "Save Article"}}, {new: true}, function(err, data) {
				res.redirect("/");
			});
		}
		else {
			Article.findByIdAndUpdate(req.params.id, {$set: {issaved: true, status: "Saved"}}, {new: true}, function(err, data) {
				res.redirect("/saved");
			});
		}
	});
});

app.post("/note/:id", function(req, res) {
	var note = new Note(req.body);
	note.save(function(err, doc) {
		if (err) throw err;
		Article.findByIdAndUpdate(req.params.id, {$set: {"note": doc._id}}, {new: true}, function(err, newdoc) {
			if (err) throw err;
			else {
				res.send(newdoc);
			}
		});
	});
});

app.get("/note/:id", function(req, res) {
	var id = req.params.id;
	Article.findById(id).populate("note").exec(function(err, data) {
		res.send(data.note);
	})
})