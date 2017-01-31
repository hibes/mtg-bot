"use strict";

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

app.post('/', function(req, res) {
  if (req.params['text'] !== undefined) {
    res.sendStatus(200);
    let lUrl = url.parse(req.params['response_url']);

    let options = {
      hostname: lUrl.hostname,
      port: lUrl.port,
      path: lUrl.path,
      method: "POST"
    };

    getCard(req.params['text'], function(imageUrl) {
      var req = https.request(options, (res) => {
        console.log(res);
      });

      res.status(200).send(imageUrl);
    });
  } else {
    console.log("Request failed: ");
    console.log(req);

    res.sendStatus(400);
  }
});

app.listen(PORT_NUMBER, function() {
  console.log("Listening on port " + PORT_NUMBER);
});
