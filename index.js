const appPort = process.env.PORT || 8080;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config/config');
const mongojs = require('mongojs');
const db = mongojs(config.dburl, ['short_urls']);

db.on('connect', () => {
    console.log('connected to database successfuly.')
});

app.use(express.static('public'));
app.use(helmet());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.render('index');
});

app.get('/ls/:slug', (req, res, next) => {
    console.log(req.params.length)
    if (req.params.slug != undefined) {
        console.log(req.params.slug);
        db.short_urls.find({
            slug: req.params.slug
        }, (err, docs) => {
            if (docs.length <= 0) {
                res.render('error');
            }
            else {
                res.redirect(docs[0].url)
            }
        });
    }
    else {
        res.render('error');
    }
});

app.post('/new', (req, res, next) => {
    console.log(req.body.slug, req.body.url);
    db.short_urls.find({
        slug: req.body.slug
    }, (err, docs) => {
        if (docs) {
            console.log(docs);
            if (docs.length <= 0) {
                db.short_urls.save({
                    slug: req.body.slug,
                    url: req.body.url,
                });
                res.render('finished', {
                    slug: req.body.slug,
                    url: req.body.url,
                    newurl: 'http://localhost:8080/ls/' + req.body.slug
                });
            }
            else {
                console.log('it is already there');
                res.render('exists', {
                    url: req.body.url
                });
            }
        }
        if (err) {
            console.log(err)
        }
    });
});

app.listen(appPort, () => {
    console.log('URL_SHORTENER os listening on port: ' + appPort);
});