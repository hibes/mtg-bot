'use strict';

let bodyParser = require('body-parser');
let fs = require('fs');
let http = require('http');
let https = require('https');
let express = require('express');
let querystring = require('querystring');
let url = require('url');

let app = express();

let PORT_NUMBER = process.env.PORT || 3000;

function getCard(cardName, callback) {
  let options = {
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    'host': 'api.magicthegathering.io',
    'path': '/v1/cards?name=' + encodeURIComponent(cardName),
    'port': 443,
    'protocol': 'https:'
  };

  console.log('Trying ' + JSON.stringify(options));

  let req = https.request(options, (res) => {
    let rawData = '';

    res.on('data', (d) => {
      rawData += d;
    });

    res.on('end', () => {
      let cards = JSON.parse(rawData);

      if (cards.cards === undefined || cards.cards.length <= 0) {
        console.log(rawData);

        callback(undefined);

        return;
      }

      let lCard = cards.cards.filter((card) => {
        return (card['imageUrl'] === undefined);
      });

      callback(cards.cards.map((card) => {
        return card.imageUrl;
      }).reduce((a, b) => {
        console.log(a + ' ? ' + a + ' : ' + b);
        return (a ? a : b);
      }));
    });
  });

  req.on('error', (e) => {
    console.log(e);

    callback(undefined);
  });

  req.end();
}

function getCardImage(imageUrl, file_to_write, callback) {
  http.get(imageUrl, (res) => {
    let rawData = '';
    res.on('data', (d) => {
      rawData += d;

      console.log('Received Data for cardImage');
    });

    res.on('end', () => {
      fs.writeFile(file_to_write, rawData, 'binary', callback);

      console.log('Received all cardImage data.');
    });
  });
}

let urlEncodedBodyParser = bodyParser.urlencoded({extended:false});

app.post('/', urlEncodedBodyParser, function(req, res) {
  // Assumes content-type application/x-www-form-urlencoded
  if (req.body) {
    getCard(req.body.text, function(imageUrl) {
      console.log('getCard finished, gave: ' + imageUrl);

      if (!imageUrl) {
        res.status(503).send('An imageUrl for ' + req.body.text + ' was not found...');

        return;
      }

      let message = {
        'response_type': 'in_channel',
        'attachments': [
          {
            'title': req.body.text,
            'title_link': imageUrl.replace('/Handlers/Image.ashx', '/Pages/Card/Details.aspx'),
            'image_url': imageUrl
          }
        ]
      };

      res.status(200).json(message);

      return;
    });
  } else {
    console.log('No req.body detected.');

    res.status(400).send();

    return;
  }
});

app.use('/static', express.static('static'));

app.listen(PORT_NUMBER, function() {
  console.log('Listening on port ' + PORT_NUMBER);
});
