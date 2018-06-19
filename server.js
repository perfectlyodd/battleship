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

app.use(express.static('./dist/'));

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

app.post('/pusher/auth', function(req, res) {
    let socketId = req.body.socket_id;
    let channel = req.body.channel_name;
    let presenceData = {
        user_id: crypto.randomBytes(16).toString("hex")
    };
    let auth = pusher.authenticate(socketId, channel, presenceData);
    res.send(auth);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/index.html'));
});

var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:3000'));