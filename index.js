"use strict";

let https = require('https');

https.get('https://api.magicthegathering.io/v1/cards?name=Sol%20Ring', (res) => {
  let rawData = '';

  res.on('data', (d) => {
    rawData += d;
  });

  res.on('end', () => {
    console.log(rawData);
    let cards = JSON.parse(rawData);
    console.log("Cards!");
    console.log(cards.cards[0].imageUrl);
  });
});

