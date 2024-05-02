const express = require('express'),
    morgan = require('morgan');
const app = express();

let topMovies = [
    {
        title: 'The Shawshank Redemption',
        year: '1994'
    },
    {
        title: 'The Godfather',
        year: '1972'
    },
    {
        title: 'The Dark Knight',
        year: '2008'
    },
    {
        title: 'The Godfather Part 2',
        year: '1974'
    },
    {
        title: '12 Angry Men',
        year: '1957'
    },
    {
        title: 'Schindler\'s List',
        year: '1993'
    },
    {
        title: 'The Lord of the Rings: The Return of the King',
        year: '2003'
    },
    {
        title: 'Pulp Fiction',
        year: '1994'
    },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        year: '2001'
    },
    {
        title: 'The Good, the Bad and the Ugly',
        year: '1966'
    }
];

app.use(morgan('common'));
app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to my box office!');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is not working as expected!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});