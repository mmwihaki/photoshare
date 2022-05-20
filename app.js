import express from 'express'

const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))

//config to access form info
app.use(express.urlencoded({extended: false}))

const users = [
    {
        fullname: 'Mini Me',
        email: 'kessylyeon@yahoo.com',
        password: '5yv9vdUseJ@ChU'
    }
]

app.get('/', (req, res) => {
    res.render('index', {title: true})
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
    let user = users.find(user => user.email === req.body.email)

    if (user) {
        if (user.password === req.body.password) {
            console.log('Access granted')
            res.redirect('/')
        } else {
            let user = {
                email: req.body.email,
                password: req.body.password
            }
            let message = 'Email/Password mismatch'
            res.render('login', {error: true, message: message, user: user})
        }
    } else {
        let user = {
            email: req.body.email,
            password: req.body.password
        }
        let message = 'Account does not exist. Please create one.'
        res.render('login', {error: true, message: message, user: user})
    }
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
        
        let user = users.find(user => user.email === req.body.email)
        if (user) {
            let user = {
                fullname: req.body.fullname,
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword
            }
            let message = 'Account already exists with the email provided.'
            res.render('signup', { error: true, message: message, user: user})
        } else {
            let user = {
                fullname: req.body.fullname,
                email: req.body.email,
                password: req.body.password
            }
            users.push(user)
            console.log(user)
            console.log('Account created successfully')
            res.redirect('/')
        }

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

app.listen(3000, () => {
    console.log('server is up and running...')
})



