const express = require('express')
const morgan = require('morgan')
const app = express()

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

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
    response.json(persons)
})

app.get('/info', (request, response) => {
    const currenteDate = new Date()
    return response.send(`
        <h1>Phonebook has info for ${persons.length} people</h1>
        ${currenteDate.toString()}
        `)
})

app.get('/api/persons/:id', (request, response) => {

    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

// POST
const MAX = 10000
const generateId = () => {
    return Math.floor(Math.random() * MAX)
}
console.log(generateId())

app.post('/api/persons', (request, response) => {

    const body = request.body

    if (!body.name) {
        return response.status(400).json({ error: 'name missing' })
    }
    else if (!body.number) {
        return response.status(400).json({ error: 'number missing' })
    }
    else if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({ error: 'name was already added to the phonebook' })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)

    return response.json(persons)
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})