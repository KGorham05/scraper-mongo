const express = require("express");
const exphbs = require("express-handlebars");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const db = require("./models");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperData";

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true }, (err) => {
        if (err) throw err;
        console.log("Database Connected!");
    });

// morgan('tiny');

// Make a home route
app.get('/', (req, res) => {
    db.Article
        .find()
        .populate("comments")
        .then(dbArticles => res.render("home", { articles: dbArticles }))
});

app.get('/scrape', (req, res) => {
    axios
        .get("https://www.outsideonline.com/")
        .then(response => {
            const $ = cheerio.load(response.data);
            $("article.latest__article").each(function (i, element) {
                let link = "https://www.outsideonline.com" + $(element).find("a").attr("href");
                let title = $(element).find("a").find($("div.latest__article-text")).find("h2").text();
                let summary = $(element).find("a").find($("div.latest__article-text")).find("div").find("p").text();

                // console.log(title);
                // console.log(summary);
                // console.log(link);

                let postObj = {
                    link: link,
                    title: title,
                    summary: summary
                };

                db.Article
                    .create(postObj)
                    .then(dbArticles => console.log(dbArticles))
                    .catch(err => console.log(err));
            })
            res.redirect("/");
        })
});

// create the POST route for adding a comment 
app.post("/api/:articleId/comment", (req, res) => {
    db.Comment
        .create({body: req.body.body})
        .then(dbComment => {
            return db.Article.findOneAndUpdate({_id: req.params.articleId}, {$push: { comments: dbComment._id}}, {new: true})
        })
        .then(() => res.redirect("/"))
        .catch(err => res.json(err));
});

// create the DELETE route for deleting a comment
app.delete("/api/:commentId/delete", (req, res) => {
    db.Comment
        .deleteOne({_id: req.params.commentId})
        .then(data => res.json(data))
        .catch(err => res.json(err))
});

app.listen(PORT, () => console.log(`App is on http://localhost:${PORT}`));

