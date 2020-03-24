const fs = require('fs');
const express = require('express');
const axios = require('axios');
const randomWords = require('random-words');
const bodyParser = require('body-parser');
const mongoDb = require('mongodb');

const cors = require('cors');

const config_data = require('./config/config.json')

const mongo_url = "mongodb://" + config_data.mongodb.host + ":" + config_data.mongodb.port +"/tweets";
const output_dir = '../output/';
const negative_output_file = output_dir + 'negative_tweets.json';
const positive_output_file = output_dir + 'positive_tweets.json';

const app = express();

app.use(cors());
app.use(bodyParser.json());   

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.get("/negative_tweets", async (req, res, next) => {
    res.download(negative_output_file, 'negative_tweets.json');
});

app.get("/positive_tweets", async (req, res, next) => {
    res.download(positive_output_file, 'negative_tweets.json');
});

app.get("/random_tweet", async (req, res, next) => {
    let token = await getAuthToken();
    let tweet = await getRandomTweet(token);

    res.json(tweet);
});

app.post("/rate_tweet", async (req, res, next) => {
    let tweet = JSON.parse(req.body.tweet);
    
    try {
        if (req.body.positive) {
            writePositiveResponseToDB(tweet);
            return res.json({status: 200});
        }
        writeNegativeResponseToDB(tweet);
        res.json({status: 200});
    } catch (error) {
        console.log(error);
        res.json({status: 500});
    }
});

async function getAuthToken() {
    let token = config_data.twitter.api_key + ':' + config_data.twitter.api_secret;
    let url = 'https://' + token + '@api.twitter.com/oauth2/token';
    let response = await axios.post(url, null, {params: {'grant_type': 'client_credentials'}});

    return response.data.access_token;
}

async function getRandomTweet(token) {
    let random_word = randomWords();

    let url = "https://api.twitter.com/1.1/search/tweets.json?count=1&lang=en&q=" + random_word;
    let response = await axios.get(url, {headers: {'Authorization': 'Bearer ' + token}});

    return getRandomItem(response.data.statuses);
}

function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function writePositiveResponseToDB(tweet) {
    mongoDb.connect(mongo_url, function(err, db) {
        if (err) throw err;

        let dbo = db.db("tweets");

        dbo.collection('positive').insertOne(tweet, function (err, res) {
            db.close();
        });
    });
}

function writeNegativeResponseToDB(tweet) {
    mongoDb.connect(mongo_url, function(err, db) {
        if (err) throw err;

        let dbo = db.db("tweets");

        dbo.collection('negative').insertOne(tweet, function (err, res) {
            db.close();
        });
    });
}

async function generateNegativeNltkFile() {
    await truncateNegativeTweetFiles();

    mongoDb.connect(mongo_url, function(err, db) {
        if (err) throw err;

        let dbo = db.db("tweets");

        dbo.collection('negative').find({}).toArray(function (err, res) {
            db.close();
            for (let i = 0; i < res.length; i++) {
                fs.appendFileSync(negative_output_file, JSON.stringify(res[i]) + '\r\n');
            }
        });
    });
}

async function generatePositiveNltkFile() {
    await truncatePositiveTweetFiles();

    mongoDb.connect(mongo_url, function(err, db) {
        if (err) throw err;

        let dbo = db.db("tweets");

        dbo.collection('positive').find({}).toArray(function (err, res) {
            db.close();
            for (let i = 0; i < res.length; i++) {
                fs.appendFileSync(positive_output_file, JSON.stringify(res[i]) + '\r\n');
            }
        });
    });
}

async function truncateNegativeTweetFiles() {
    return await truncateFile(negative_output_file);
}

async function truncatePositiveTweetFiles() {
    return await truncateFile(positive_output_file);
}

function truncateFile(file) {
    return new Promise(function (resolve, reject) {
        fs.truncate(file, 0, function(){
            resolve();
        });
    });
}

generateNegativeNltkFile();
generatePositiveNltkFile();