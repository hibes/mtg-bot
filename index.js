"use strict";

let bodyParser = require('body-parser');
let fs = require('fs');
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

function getCardImage(imageUrl, file_to_write, callback) {
  http.get(imageUrl, (res) => {
    let rawData = '';
    res.on('data', (d) => {
      rawData += d;

      console.log("Received Data for cardImage");
    });

    res.on('end', () => {
      fs.writeFile(file_to_write, rawData, 'binary', callback);

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
        let message = {
          "image_url": imageUrl
        };

        res.status(200).json(message);

        /*
        console.log("Getting card image");

        let fname = req.body.text + ".jpg";
        let file_to_write = './static/' + fname;

        getCardImage(imageUrl, file_to_write, (err) => {
          console.log("Wrote " + file_to_write);

          if (!err) {
            let message = {
              "image_url": req.protocol + "://" + req.hostname + "/static/" + encodeURIComponent(fname)
            };

            res.status(200).json(message);

            console.log("Sent: " + message);

            return;
          }

          console.log(err);

          console.log("Request failed: ");
          console.log(req);

          res.sendStatus(400);
        });
        */
      });
    }
  }
});

app.use('/static', express.static('static'));

app.listen(PORT_NUMBER, function() {
  console.log("Listening on port " + PORT_NUMBER);
});
