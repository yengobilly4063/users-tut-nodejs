import {
    SQUser,
    connectDB,
    findOneUser,
    createUser,
    sanitizedUser,
    userQueryParams,
} from '../models/users-sequelize.js';

export async function findOrCreateUser(req, res, next) {
    try {
        await connectDB();
        let user = await findOneUser(req.query.username);
        if (!user) {
            user = await createUser(req);
            if (!user) throw new Error('No user created');
        }
        res.contentType = 'json';
        res.send(user);
        return next(false);
    } catch (err) {
        res.send(500, err);
        next(false);
    }
}

export async function createeUser(req, res, next) {
    try {
        await connectDB();
        let user = await findOneUser(req.query.username);
        if (!user) {
            user = await createUser(req);
            if (!user) throw new Error('No user created');
        }
        res.contentType = 'json';
        res.send(user);
        return next(false);
    } catch (err) {
        res.send(500, err);
        next(false);
    }
}

export async function findUserByUsernamne(req, res, next) {
    try {
        await connectDB();
        const user = await findOneUser(req.params.username);
        if (!user) {
            res.send(404, new Error('Did not find ' + req.params.username));
        } else {
            res.contentType = 'json';
            res.send(user);
        }
        next(false);
    } catch (err) {
        res.send(500, err);
        next(false);
    }
}

export async function findAllUser(req, res, next) {
    try {
        await connectDB();
        let userlist = await SQUser.findAll({});
        userlist = userlist.map((user) => sanitizedUser(user));
        if (!userlist) userlist = [];
        res.contentType = 'json';
        res.send(userlist);
        next(false);
    } catch (err) {
        res.send(500, err);
        next(false);
    }
}

export async function updateUser(req, res, next) {
    try {
        await connectDB();
        let userToUpdate = userQueryParams(req);
        await SQUser.update(userToUpdate, { where: { username: req.params.username } });
        const result = await findOneUser(req.params.username);
        res.contentType = 'json';
        res.send(result);
        next(false);
    } catch (err) {
        res.send(500, err);
        next(false);
    }
}

export async function deleteUser(req, res, next) {
    try {
        await connectDB();
        const user = await SQUser.findOne({
            where: { username: req.params.username },
        });
        if (!user) {
            res.send(
                404,
                new Error(`Did not find requested ${req.params.username}
        to delete`)
            );
        } else {
            user.destroy();
            res.contentType = 'json';
            res.send({});
        }
        next(false);
    } catch (err) {
        res.send(500, err);
        next(false);
    }
}

export async function checkUserPassword(req, res, next) {
    try {
        await connectDB();
        const user = await SQUser.findOne({
            where: { username: req.query.username },
        });
        let checked;
        if (!user) {
            checked = {
                check: false,
                username: req.query.username,
                message: 'Could not find user',
            };
        } else if (user.username === req.query.username && user.password === req.query.password) {
            checked = { check: true, username: user.username };
        } else {
            checked = {
                check: false,
                username: req.query.username,
                message: 'Incorrect password',
            };
        }
        res.contentType = 'json';
        res.send(checked);
        next(false);
    } catch (err) {
        res.send(500, err);
        next(false);
    }
}
