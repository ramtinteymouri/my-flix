const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/cfDB');

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());

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
app.post('/users', async (req, res) => {
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
                        password: req.body.password,
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
app.get('/users', async (req, res) => {
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
app.get('/users/:username', async (req, res) => {
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
app.put('/users/:username', async (req, res) => {
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
app.post('/users/:username/movies/:movieID', async (req, res) => {
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
app.delete('/users/:username/movies/:movieID', async (req, res) => {
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
app.delete('/users/:username', async (req, res) => {
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
app.get('/movies', async (req, res) => {
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

app.listen(8080, () => console.log('listening to 8080'));