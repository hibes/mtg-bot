"use strict";

let https = require('https');

function getCard(cardName) {
  https.get('https://api.magicthegathering.io/v1/cards?name=' + encodeURIComponent(cardName), (res) => {
    let rawData = '';

    res.on('data', (d) => {
      rawData += d;
    });

    res.on('end', () => {
      let cards = JSON.parse(rawData);
      console.log(cards.cards[0].imageUrl);
    });
  });
}

getCard("Sol Ring");
