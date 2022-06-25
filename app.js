import express from 'express'
import mysql from 'mysql'
import bcrypt from 'bcrypt'
import session from 'express-session'
import multer from 'multer'

const app = express()

const upload = multer({dest: 'public/uploads/'})

//configure database 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'BahS#ji($bst-5G',
    database: 'photoshare',
})


app.set('view engine', 'ejs')
app.use(express.static('public'))

//config to access form info
app.use(express.urlencoded({ extended: false }))

//prepare to use session
app.use(session({
    secret: 'picha',
    resave: false,
    saveUninitialized: false
}))

//constantly check user is logged in 
app.use((req, res, next) => {
    if (req.session.userID === undefined) {
        res.locals.isLoggedIn = false
    } else {
        res.locals.isLoggedIn = true
        res.locals.username = req.session.username
    }
    next()
})

app.get('/', (req, res) => {
    res.render('index', {title: true})
})

app.get('/app', (req, res) => {
    if (res.locals.isLoggedIn) {
        res.render('home')
    } else {
        res.redirect('/login')
    }
})

//display login form
app.get('/login', (req, res) => {
    let user = {
        email: '',
        password: ''
    }
    res.render('login', {
        error: false, user: user})
})

//process login form
app.post('/login', (req, res) => {

    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [req.body.email],
        (error, results) => {
            if (results.length > 0) {

                bcrypt.compare(req.body.password, results[0].password, (error, matches) => {
                    if (matches) {
                        req.session.userID = results[0].u_id
                        req.session.username = results[0].fullname.split(' ')[0]
                        if (results[0].profile_status === 'INCOMPLETE') {
                            res.redirect('/complete-profile')
                        } else {
                            res.redirect('/app')
                        }
                    } else {
                        let user = {
                            email: req.body.email,
                            password: req.body.password
                        }
                        let message = 'Email/Password mismatch'
                        res.render('login', {error: true, message: message, user: user})
                    }
                })
                
            } else {
                let user = {
                    email: req.body.email,
                    password: req.body.password
                }
                let message = 'Account does not exist. Please create one.'
                res.render('login', {error: true, message: message, user: user})
            }
        }
    )
})

//display signup form
app.get('/signup', (req, res) => {
    let user = {
        fullname: '',
        email: '',
        password: '',
        confirmPassword: ''
    }
    res.render('signup', {error: false, user: user})
})

//process sign up form
app.post('/signup', (req, res) => {
    if (req.body.password === req.body.confirmPassword) {
        
        connection.query(
            'SELECT * FROM users WHERE email = ?', 
            [req.body.email],
            (error, results) => {
                if (results.length > 0) {
                    let user = {
                        fullname: req.body.fullname,
                        email: req.body.email,
                        password: req.body.password,
                        confirmPassword: req.body.confirmPassword
                    }
                    let message = 'Account already exists'
                    res.render('signup', { error: true, message: message, user: user})
                } else {
                    bcrypt.hash(req.body.password, 10, (error, hash) => {
                        connection.query(
                            'INSERT INTO users (fullname, email, password) VALUES (?,?,?)',
                            [req.body.fullname, req.body.email, hash],
                            (error, results) => {
                                res.redirect('/complete-profile')
                            }
                        )
                    })

                }
            }
        )

    } else {
        let user = {
            fullname: req.body.fullname,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        }
        let message = 'Passwords are not matching'
        res.render('signup', { error: true, message: message, user: user})
    }
})

//profile
app.get('/profile', (req, res) => {
    if (res.locals.isLoggedIn) {
        connection.query(
            'SELECT * FROM users WHERE u_id = ?',
            [req.session.userID],
            (error, results) => {
                const profile = {
                    name: results[0].fullname,
                    photoURL: results[0].photoURL
                }
                res.render('profile', {profile: profile})
            }
        )
    } else {
        res.redirect('/login')
    }
})

//complete profile
app.get('/complete-profile', (req, res) => {
    if (res.locals.isLoggedIn) {
        connection.query(
            'SELECT fullname, email  FROM users WHERE u_id = ?',
            [req.session.userID],
            (error, results) => {
                const profile = {
                    fullname: results[0].fullname,
                    email: results[0].email
                }
                res.render('complete-profile', {profile: profile})
            }
        )
    } else {
        res.redirect('/login')
    }
})

app.post('/complete-profile', upload.single('photo'), (req, res) => {
    const profile = {
        fullname: req.body.name,
        email: req.body.email,
        status: req.body.status,
        photoURL: req.file.filename
    }

    connection.query(
        'UPDATE users SET fullname = ?, email = ?, status = ?, photoURL = ?, profile_status = ? WHERE u_id = ?',
        [
            profile.fullname, 
            profile.email,
            profile.status, 
            profile.photoURL, 
            'COMPLETE',
            req.session.userID
        ], 
        (error, results) => {
            res.redirect('/app')
        }
    )
})

//logout functionality
app.get('/logout', (req, res) => {
    //kill the session
    req.session.destroy((error) => {
        res.redirect('/')
    })
})

app.listen(3000, () => {
    console.log('server is up and running...')
})



