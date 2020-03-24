## Sentiment Trainer Server
NodeJS server side code for a sentiment analysis training algorithm data seed.  This server works with the sentiment trainer client to pull random tweets and allow you to rate them as positive or negative. You can then add your classified tweets to the nltk tweets json files and use them to train sentiment analysis algorithms.

### Requirements
* nodejs v8.10.0+
* MongoDB

### Installation
Run the npm install command as shown below in the root of the repo.

```
npm install
```
Once you have all the dependencies installed from the previous command you need to go into the config directory and make a copy of the 'config.json.template' file named 'config.json'. You can do this by running the command below from the root of the project.
```
cp ./config/config.json.template ./config/config.json
```

### Configuration
The 'config.json' file that we created in the last step contains all the configuration items needed for the program to run.  Below is a list of each key in the json object and what they represent.

- twitter
  - api_key
    - Your twitter API Key
  - api_secret
    - Your twitter API Secret
- mongodb
  - port
    - Port number your mongo server is listening on
  - host
    - IP address of your mongo server

### Starting The Server
The server can be started using the command below but we highly recommend using 'nodemon' in development. More information on nodemon can be found [here](https://nodemon.io/).
```
node server.js
```

### GET Endpoints
- /negative_tweets
  - Get a JSON file containing all the negative tweets in your database (including the nltk default tweets)
- /positive_tweets
  - Get a JSON file containing all the positive tweets in your database (including the nltk default tweets)
- /random_tweet
  - Get a random tweet

### POST Endpoints
- /rate_tweet
  - Used to rate a tweet as positive or negative, adding it to your database. This endpoint takes on parameter called 'tweet'. The value of this parameter is a JSON object of the tweet you were passed from the random_tweet endpoint