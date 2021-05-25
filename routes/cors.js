const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['htts://localhost:3000', 'https://localhost:3443', 'http://192.168.0.230:3001'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);