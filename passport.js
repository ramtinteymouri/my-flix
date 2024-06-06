require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let User = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
        },
        async (username, password, callback) => {
            console.log(`${username}`);
            await User.findOne({ username: username })
                .then((user) => {
                    if (!user) {
                        console.log('incorrect username');
                        return callback(null, false, {
                            message: 'Incorrect username or password.',
                        });
                    }
                    if (!user.validatePassword(password)) {
                        console.log('incorrect password');
                        return callback(null, false, { message: 'Incorrect password.' });
                    }
                    console.log('finished');
                    return callback(null, user);
                })
                .catch((error) => {
                    if (error) {
                        console.error(error);
                        return callback(error);
                    }
                })
        }
    )
);

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
}, async (jwtPayload, callback) => {
    return await User.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
}));