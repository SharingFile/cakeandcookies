require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const session = require('express-session'); // Maintaining Cart
const flash = require('express-flash'); // Session
const MongoDbStore = require('connect-mongo')(session);
const passport = require('passport');
const Emitter = require('events')

// Database Connection
mongoose.connect(process.env.MONGO_CONNECTION_URL, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Connection success');
}).catch(err => {
    console.log('Connection failed');
});


// Session Store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

// Event Emitter   For using socket.io in status controller
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

// Session Config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24} //Time in miliseconds
}))

// Passport Config
const passportInit = require('./app/config/passport');
const { Passport } = require('passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

// Calling Flash
app.use(flash())

// Assets
app.use(express.static('public'));
app.use(express.urlencoded( { extended: false } )) // For recieveing the data from Register page..
app.use(express.json());

// Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session; // For Cart Counting ejs
    res.locals.user = req.user
    next();
});

// Set template engine 
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs');

// Calling Routes
require('./routes/web')(app);

// Setting PORT
const server = app.listen(PORT, () => console.log(`Listening on PORT : ${PORT}`));

// Socket
const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // Joining Room (Unique Name)
    socket.on('join', (orderId) => {               //join was emited from app.js
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {         // Reciving id and status from statusController
    io.to(`order_${data.id}`).emit('orderUpdated', data)     //Sending data to client on app.js
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})