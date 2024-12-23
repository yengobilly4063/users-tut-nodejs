import { default as program } from 'commander';
import { default as restify } from 'restify-clients';
import * as util from 'util';
import dotenv from 'dotenv';
dotenv.config();

let client_port;
let client_host;
let client_version = '*';
let client_protocol;
let authid = 'them';
let authcode = 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF';

const client = (program) => {
    if (typeof process.env.PORT === 'string') client_port = Number.parseInt(process.env.PORT);
    if (typeof program.port === 'string') client_port = Number.parseInt(program.port);
    if (typeof program.host === 'string') client_host = program.host;
    if (typeof program.url === 'string') {
        let purl = new URL(program.url);
        if (purl.host && purl.host !== '') client_host = purl.host;
        if (purl.port && purl.port !== '') client_port = purl.port;
        if (purl.protocol && purl.protocol !== '') client_protocol = purl.protocol;
    }
    let connect_url = new URL('http://localhost:5858');

    if (client_protocol) connect_url.protocol = client_protocol;
    if (client_host) connect_url.host = client_host;
    if (client_port) connect_url.port = client_port;
    let client = restify.createJsonClient({
        url: connect_url.href,
        version: client_version,
    });
    client.basicAuth(authid, authcode);
    return client;
};
program
    .option('-p, --port <port>', 'Port number for user server, if using localhost')
    .option('-h, --host <host>', 'Port number for user server, if using localhost')
    .option('-u, --url <url>', 'Connection URL for user server, if using a remote server');

program
    .command('add <username>')
    .description('Add a user to the user server')
    .option('--password <password>', 'Password for new user')
    .option('--family-name <familyName>', 'Family name, or last name, of the user')
    .option('--given-name <givenName>', 'Given name, or first name, of the user')
    .option('--middle-name <middleName>', 'Middle name of the user')
    .option('--email <email>', 'Email address for the user')
    .action((username, cmdObj) => {
        const topost = {
            username,
            password: cmdObj.password,
            provider: 'local',
            familyName: cmdObj.familyName,
            givenName: cmdObj.givenName,
            middleName: cmdObj.middleName,
            emails: [],
            photos: [],
        };
        if (typeof cmdObj.email !== 'undefined') topost.emails.push(cmdObj.email);

        const options = {
            path: '/create-user',
            query: topost,
        };
        client(program).post(options, (err, req, res, obj) => {
            if (err) console.error(err.stack);
            else console.log('Created ' + util.inspect(obj));
        });
    });

program
    .command('find-or-create <username>')
    .description('Add a user to the user server')
    .option('--password <password>', 'Password for new user')
    .option('--family-name <familyName>', 'Family name, or last name, of the user')
    .option('--given-name <givenName>', 'Given name, or first name, of the user')
    .option('--middle-name <middleName>', 'Middle name of the user')
    .option('--email <email>', 'Email address for the user')
    .action((username, cmdObj) => {
        const topost = {
            username,
            password: cmdObj.password,
            provider: 'local',
            familyName: cmdObj.familyName,
            givenName: cmdObj.givenName,
            middleName: cmdObj.middleName,
            emails: [],
            photos: [],
        };
        if (typeof cmdObj.email !== 'undefined') topost.emails.push(cmdObj.email);

        const options = {
            path: '/find-or-create',
            query: topost,
        };

        client(program).post(options, (err, req, res, obj) => {
            if (err) console.error(err.stack);
            else console.log('Found or Created ' + util.inspect(obj));
        });
    });

program
    .command('find <username>')
    .description('Search for a user on the user server')
    .action((username, cmdObj) => {
        const options = { path: `/find/${username}` };
        client(program).get(options, (err, req, res, obj) => {
            if (err) console.error(err.stack);
            else console.log('Found ' + util.inspect(obj));
        });
    });

program
    .command('list-users')
    .description('List all users on the user server')
    .action((cmdObj) => {
        client(program).get('/list', (err, req, res, obj) => {
            if (err) console.error(err.stack);
            else console.log(obj);
        });
    });

program
    .command('update <username>')
    .description('Add a user to the user server')
    .option('--password <password>', 'Password for new user')
    .option('--family-name <familyName>', 'Family name, or last name, of the user')
    .option('--given-name <givenName>', 'Given name, or first name, of the user')
    .option('--middle-name <middleName>', 'Middle name of the user')
    .option('--email <email>', 'Email address for the user')
    .action((username, cmdObj) => {
        const topost = {
            username,
            password: cmdObj.password,
            familyName: cmdObj.familyName,
            givenName: cmdObj.givenName,
            middleName: cmdObj.middleName,
            emails: [],
            photos: [],
        };
        if (typeof cmdObj.email !== 'undefined') topost.emails.push(cmdObj.email);

        const options = {
            path: `/update-user/${username}`,
            query: topost,
        };

        client(program).post(options, (err, req, res, obj) => {
            if (err) console.error(err.stack);
            else console.log('Updated ' + util.inspect(obj));
        });
    });

program
    .command('destroy <username>')
    .description('Destroy a user on the user server')
    .action((username, cmdObj) => {
        const options = { path: `/destroy/${username}` };

        client(program).del(options, (err, req, res, obj) => {
            if (err) console.error(err.stack);
            else console.log('Deleted - result= ' + util.inspect(obj));
        });
    });

program
    .command('password-check <username> <password>')
    .description('Check whether the user password checks out')
    .action((username, password, cmdObj) => {
        const options = {
            path: '/password-check',
            query: { username, password },
        };
        client(program).post(options, (err, req, res, obj) => {
            if (err) console.error(err.stack);
            else console.log(obj);
        });
    });

program.parse(process.argv);
