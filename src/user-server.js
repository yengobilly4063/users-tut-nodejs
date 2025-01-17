import restify from 'restify';
import * as util from 'util';

import {
    findOrCreateUser,
    createeUser,
    findUserByUsernamne,
    findAllUser,
    updateUser,
    deleteUser,
    checkUserPassword,
} from './services/user.service.js';
import dotenv from 'dotenv';
dotenv.config();

import DBG from 'debug';
const log = DBG('users:service');
const error = DBG('users:error');

// Mimic API Key authentication.
var apiKeys = [{ user: 'them', key: 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF' }];

///////////// Set up the REST server
var server = restify.createServer({
    name: 'User-Auth-Service',
    version: '0.0.1',
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(
    restify.plugins.bodyParser({
        mapParams: true,
    })
);

server.post('/create-user', createeUser);
server.post('/find-or-create', findOrCreateUser);
server.get('/find/:username', findUserByUsernamne);
server.get('/list', findAllUser);
server.post('/update-user/:username', updateUser);
server.del('/destroy/:username', deleteUser);
server.post('/password-check', checkUserPassword);

const host = process.env.REST_LISTEN ? process.env.REST_LISTEN : 'localhost';
const port = process.env.PORT ? process.env.PORT : 5858;

server.listen(port, host, function () {
    log(`${server.name} listening at ${server.url}`);
});

process.on('uncaughtException', function (err) {
    console.error('UNCAUGHT EXCEPTION - ' + (err.stack || err));
    process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
    console.error(`UNHANDLED PROMISE REJECTION: ${util.inspect(p)}
    reason: ${reason}`);
    process.exit(1);
});

function check(req, res, next) {
    if (req.authorization && req.authorization.basic) {
        var found = false;
        for (let auth of apiKeys) {
            if (
                auth.key === req.authorization.basic.password &&
                auth.user === req.authorization.basic.username
            ) {
                found = true;
                break;
            }
        }
        if (found) next();
        else {
            res.send(401, new Error('Not authenticated'));
            next(false);
        }
    } else {
        res.send(500, new Error('No Authorization Key'));
        next(false);
    }
}
