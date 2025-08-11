require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())
morgan.token('body', (req, res) => {
    if (req.method === 'POST')
        return JSON.stringify(req.body)
    else
        return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// GET
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    const currentDate = new Date()

    Person.countDocuments({})
        .then(count => {
            response.send(`
        <h1>Phonebook has info for ${count} people</h1>
        <p>${currentDate.toString()}</p>
        `)
        })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

// POST
// const MAX = 10000
// const generateId = () => {
//     return Math.floor(Math.random() * MAX)
// }
// console.log(generateId())

app.post('/api/persons', (request, response) => {

    const body = request.body

    if (!body.name) {
        return response.status(400).json({ error: 'name missing' })
    }
    else if (!body.number) {
        return response.status(400).json({ error: 'number missing' })
    }
    // else if (Person.find(p => p.name === body.name)) {
    //     return response.status(400).json({ error: 'name was already added to the phonebook' })
    // }

    const person = new Person({
        name: `${body.name}`,
        number: `${body.number}`,
    })

    person.save().then(savedPerson => {
        console.log(`added ${savedPerson.name} number ${savedPerson.number} to phonebook`)
        Person.find({}).then(allPersons => {
            response.json(allPersons)
        })
    })
})

// DELETE
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})