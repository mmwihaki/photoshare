import express from 'express'

const app = express()

app.set('view engine', 'ejs')

const colors = ['Red', 'Yellow', 'Blue', 'Green', 'Orange']

app.get('/', (req, res) => {
    res.render('index', {title: true, colors: colors})
})

app.get('/login', (req, res) => {
    res.render('login')
})

//create a signup route that sends 'sign up page' as response

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.listen(3000, () => {
    console.log('server is up and running...')
})



