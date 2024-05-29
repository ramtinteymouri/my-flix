const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: {
        name: String,
        description: String
    },
    director: {
        name: String,
        birth_date: String,
        nationality: String,
        bio: String
    },
    release_year: Number,
    rating: Number,
    additional_attributes: {
        runtime: Number,
        main_actors: [String]
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    first_name: String,
    last_name: String,
    birthday: Date,
    favorite_movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;