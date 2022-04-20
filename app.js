import express from 'express'

const app = express()

app.get('/', (req, res) => {
    res.send('hello world!')
})

app.get('/login', (req, res) => {
    res.send('login page')
})

//create a signup route that sends 'sign up page' as response

app.get('/signup', (req, res) => {
    res.send('sign up page')
})

app.listen(3000, () => {
    console.log('server is up and running...')
})



