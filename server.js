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