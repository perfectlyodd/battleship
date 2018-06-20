const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Pusher = require('pusher');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const pusher = new Pusher({
    appId: '546378',
    key: '1064401eb8ccf6725b67',
    secret: '04b27248b1c3978dfb05',
    cluster: 'us2',
    encrypted: true
});


// Responsible for serving JS, CSS, and index.html files
app.use(express.static('./dist/battleship/'));
    // Changed from origignal--Angular build places files in dist/battleship

// CORS
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

// Authentication endpoint
app.post('/pusher/auth', function(req, res) {
    let socketId = req.body.socket_id;
    let channel = req.body.channel_name;
    let presenceData = {
        user_id: crypto.randomBytes(16).toString("hex")
    };
    let auth = pusher.authenticate(socketId, channel, presenceData);
    res.send(auth);
});

// Catches and directs all other requests to built app view
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/battleship/index.html'));
});

var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:3000.  WAZZUP'));

