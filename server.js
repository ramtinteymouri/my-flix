const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

app.use(bodyParser.json());

let users = [
    {
        id: 1,
        name: "Max",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "John",
        favoriteMovies: ["The Godfather"]
    }
];

let movies = [
    {
        Title: 'The Shawshank Redemption',
        Description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        Genre: {
            Name: 'Drama',
            Description: 'A genre that explores serious themes and often focuses on emotional conflict.'
        },
        Director: {
            Name: 'Frank Darabont',
            Bio: 'Frank Darabont is a Hungarian-American film director, screenwriter, and producer.',
            Birth: 'January 28, 1959'
        },
        ImageURL: 'https://example.com/shawshank_redemption.jpg',
        Featured: false
    },
    {
        Title: 'The Godfather',
        Description: "An organized crime dynasty's aging patriarch transfers control of his clandestine empire to his reluctant son.",
        Genre: {
            Name: 'Crime',
            Description: 'A genre that revolves around criminal activities and often involves law enforcement.'
        },
        Director: {
            Name: 'Francis Ford Coppola',
            Bio: 'Francis Ford Coppola is an American film director, producer, and screenwriter.',
            Birth: 'April 7, 1939'
        },
        ImageURL: 'https://example.com/godfather.jpg',
        Featured: false
    },
    {
        Title: 'The Dark Knight',
        Description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        Genre: {
            Name: 'Action',
            Description: 'A genre characterized by fast-paced sequences, violence, and heroic protagonists.'
        },
        Director: {
            Name: 'Christopher Nolan',
            Bio: 'Christopher Nolan is a British-American film director, producer, and screenwriter.',
            Birth: 'July 30, 1970'
        },
        ImageURL: 'https://example.com/dark_knight.jpg',
        Featured: false
    }
];

// Creates/Adds new user

app.post('/users', (req, res) => {
    const newUser = req.body;
    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('users need to have names');
    }
});

// Updates user name with id

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    let user = users.find(user => user.id == id);
    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('No such user!');
    }
});

// Adds movie to users favorite list

app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`The movie name: ${movieTitle} has been added to user's array with the id:${id}`);
    } else {
        res.status(400).send('No such user!');
    }
});

// Deletes movie from users favorite list

app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(200).send(`The movie name: ${movieTitle} has been removed from user's array with the id:${id}`);
    } else {
        res.status(400).send('No such user!');
    }
});

// Removes the user

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send(`User ${id} has been deleted`);
    } else {
        res.status(400).send('No such user!');
    }
});

// Gets the list of data about ALL movies

app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

// Gets the movie by movie title

app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie!');
    }
});

// Gets the Genre by genre name

app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;
    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre!');
    }
});

// Gets the Director data by director name

app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;
    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No such director!');
    }
});

app.listen(8080, () => console.log('listening to 8080'));