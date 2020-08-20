const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')
const router = require('./routes/index')
const routerAuth = require('./routes/auth')
const storiesRoute = require('./routes/stories')
const mongoose = require('mongoose')
const { formatDate, stripTag, truncate, editIcon, select } = require('./helpers/hbs')

//Load config
dotenv.config({path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

connectDB()
const app = express()

//Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


//Method override
app.use(methodOverride(function(req,res) {
    if(req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//Handlebars
app.engine('.hbs', 
    exphbs({
        helpers: {
            formatDate,
            truncate,
            stripTag,
            editIcon,
            select,
        },
        defaultLayout: 'main', 
        extname: '.hbs'
}))
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

//Set global variable
app.use(function (req, res, next){
    res.locals.user = req.user || null
    next()
})

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', router)
app.use('/auth', routerAuth)
app.use('/stories', storiesRoute)

const PORT = process.env.PORT || 3000


app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)