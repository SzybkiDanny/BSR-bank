"use strict";

import service from './services/service-interface';

var config = require('config');
var soap = require('soap');
var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var basicAuth = require('basic-auth-connect');
var bodyParser = require('body-parser');

var serverConfig = config.get('serverConfig');
var dbConfig = config.get('dbConfig');
var realmConfig = config.get('realmConfig');
var xml = fs.readFileSync('server/bank-service.wsdl', 'utf8');
var app = express();
var jsonParser = bodyParser.json();
var bankAuthenticator = basicAuth((username, password) => {
    return realmConfig.bankUsername == username &&
        realmConfig.bankPassword == password;
});

mongoose.connect(`mongodb://${dbConfig.dbHost}:${dbConfig.port}/${dbConfig.dbName}`);

app.post('/accounts/:accountNumber', bankAuthenticator, jsonParser, (req, res) => {
    var accountFrom = req.body.from;
    var accountTo = req.params.accountNumber;
    var amount = req.body.amount;
    var title = req.body.title;

    var getBankId = (accountNumber) => {
        return accountNumber.substring(2, 10);
    }

    if (accountFrom.length != 26 || accountTo.length != 26)
        return res.status(400).json({ "error": "Incorrect account format" });

    if (getBankId(accountTo) != realmConfig.bankId)
        return res.status(451).json({ "error": "Incorrect recipient's account number" });

    if (amount <= 0)
        return res.status(400).json({ "error": "The amount must be positive" });

    service.Bank.AccountService.transferMoney({
        accountFrom: accountFrom,
        accountTo: accountTo,
        amount: amount / 100,
        title: title
    }, (result) => {
        console.log(result);
        if (result.result)
            return res.status(201).send();
        else
            return res.status(500).json({ error: result.error });
    }, null, req)
})

app.listen(serverConfig.port, () => {
    var server = soap.listen(app, '/bank', service, xml);

    console.log(`Server listening on port: ${serverConfig.port}`);
});

