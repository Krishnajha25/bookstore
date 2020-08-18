const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')
const router = require('./routes/index')
const routerAuth = require('./routes/auth')
const mongoose = require('mongoose')

//Load config
dotenv.config({path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

connectDB()
const app = express()

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Handlebars
app.engine('.hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}))
app.set('view engine', '.hbs')

//Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())


//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', router)
app.use('/auth', routerAuth)

const PORT = process.env.PORT || 3000


app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)