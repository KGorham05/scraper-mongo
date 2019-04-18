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

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scarperData";

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true }, (err) => {
        if (err) throw err;
        console.log("Database Connected!");
    });


app.get('/', function (req, res) {
    axios   
        .get("https://www.outsideonline.com/")
        .then(response => {
            res.send(response.data)
            const $ = cheerio.load(response.data);
            $("article.latest__article").each(function(i, element) {
                let link = "https://www.outsideonline.com" + $(element).find("a").attr("href");
                let title = $(element).find("a").find($("div.latest__article-text")).find("h2").text();
                let summary = $(element).find("a").find($("div.latest__article-text")).find("div").find("p").text();

                console.log(title);
                console.log(summary);
                console.log(link);
                
                // let postObj = {
                //     link: link,
                //     title: title,
                //     summary: summary
                // };
                // db.Article
                //     .create(postObj)
                //     .then(dbArticle => console.log(dbArticle))
                //     .catch(err => console.log(err));
                
            })
        })
        // .then(() => {
        //   res.send('Scraped data from outsideonline.com')  
        // })

    
})

app.listen(PORT, () => console.log(`App is on http://localhost:${PORT}`));

