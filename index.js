"use strict";

let https = require('https');
let express = require('express');
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

app.get('/', function(req, res) {
  getCard(req.params['card']), function(imageUrl) {
    res.status(200).send(imageUrl);
  });
});

app.listen(PORT_NUMBER, function() {
  console.log("Listening on port " + PORT_NUMBER);
});
