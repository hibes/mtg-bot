"use strict";

let bodyParser = require('body-parser');
let http = require('http');
let https = require('https');
let express = require('express');
let url = require('url');

let app = express();

let PORT_NUMBER = process.env.PORT || 3000;

function getCard(cardName, callback) {
  https.get('https://api.magicthegathering.io/v1/cards?name=' + encodeURIComponent(cardName), (res) => {
    let rawData = '';

    res.on('data', (d) => {
      rawData += d;
    });

    res.on('end', () => {
      let cards = JSON.parse(rawData);
      console.log(cards.cards[0].imageUrl);

      callback(cards.cards[0].imageUrl);
    });
  });
}

function getCardImage(imageUrl, callback) {
  http.get(imageUrl, (res) => {
    let rawData = '';
    res.on('data', (d) => {
      rawData += d;

      console.log("Received Data for cardImage");
    });

    res.on('end', () => {
      callback(rawData);

      console.log("Received all cardImage data.");
    });
  });
}

let urlEncodedBodyParser = bodyParser.urlencoded({extended:false});

app.post('/', urlEncodedBodyParser, function(req, res) {
  // Assumes content-type application/x-www-form-urlencoded
  if (req.body) {
    if (req.body.response_url) {
      let lUrl = url.parse(req.body.response_url);

      let options = {
        hostname: lUrl.hostname,
        port: lUrl.port,
        path: lUrl.path,
        method: "POST"
      };

      getCard(req.body.text, function(imageUrl) {
        /*
         * This doesn't seem to be necessary code.
        var req = https.request(options, (res) => {
          console.log(res);
        });
        */

        console.log("Getting card image");

        getCardImage(imageUrl, (data) => {
          res.status(200).send(data);
        });
      });

      return;
    }
  }

  console.log("Request failed: ");
  console.log(req);

  res.sendStatus(400);
});

app.listen(PORT_NUMBER, function() {
  console.log("Listening on port " + PORT_NUMBER);
});
