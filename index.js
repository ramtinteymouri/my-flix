require('dotenv').config();
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
//mongoose.connect('mongodb://localhost:27017/cfDB');
mongoose.connect(process.env.CONNECTION_URI);

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    passport = require('passport');
require('./passport');
const { check, validationResult } = require('express-validator');
app.use(bodyParser.json());
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));
let auth = require('./auth')(app);

// Creates/Adds new user

//Add a user
/* We’ll expect JSON in this format
{
  id: Integer,
  first_name: String,
  last_name: String,
  username: String,
  password: String,
  email: String,
  birthday: Date
}*/
app.post('/users',
    [
        check('username', 'Username is required').isLength({ min: 5 }),
        check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('password', 'Password is required').not().isEmpty(),
        check('email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {

        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.password);
        await Users.findOne({ username: req.body.username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.username + ' already exists');
                } else {
                    Users
                        .create({
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            username: req.body.username,
                            password: hashedPassword,
                            email: req.body.email,
                            birthday: req.body.birthday
                        })
                        .then((user) => { res.status(201).json(user) })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        })
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a user by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ username: req.params.username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  first_name: String,
  last_name: String,
  username: String, (required)
  password: String, (required)
  email: String, (required)
  birthday: Date
}*/
app.put('/users/:username', passport.authenticate('jwt', { session: false }), [
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    // CONDITION TO CHECK ADDED HERE
    if (req.user.username !== req.params.username) {
        return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate({ username: req.params.username }, {
        $set:
        {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            birthday: req.body.birthday
        }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })

});

// Add a movie to a user's list of favorites
app.post('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ username: req.params.username }, {
        $push: { favorite_movies: req.params.movieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Remove a movie from a user's list of favorites
app.delete('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ username: req.params.username }, {
        $pull: { favorite_movies: req.params.movieID }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Delete a user by username
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndDelete({ username: req.params.username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.username + ' was not found');
            } else {
                res.status(200).send(req.params.username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a movie info by title
app.get('/movies/:title', async (req, res) => {
    await Movies.findOne({ title: req.params.title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Gets the Genre by genre name

app.get('/movies/genre/:genreName', async (req, res) => {
    await Movies.findOne({ 'genre.name': req.params.genreName })
        .then((movie) => {
            res.json(movie.genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Gets the Director data by director name

app.get('/movies/directors/:directorName', async (req, res) => {
    await Movies.findOne({ 'director.name': req.params.directorName })
        .then((movie) => {
            res.json(movie.director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});