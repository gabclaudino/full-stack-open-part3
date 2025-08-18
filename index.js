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

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            }
            else {
                response.status(404).end()
            }

        })
        .catch(error => next(error))

})

// POST
app.post('/api/persons', (request, response, next) => {

    const body = request.body

    // if (!body.name) {
    //     return response.status(400).json({ error: 'name missing' })
    // }
    // else if (!body.number) {
    //     return response.status(400).json({ error: 'number missing' })
    // }
    // else if (Person.find(p => p.name === body.name)) {
    //     return response.status(400).json({ error: 'name was already added to the phonebook' })
    // }

    const person = new Person({
        name: `${body.name}`,
        number: `${body.number}`,
    })

    person.save()
        .then(savedPerson => {
            console.log(`added ${savedPerson.name} number ${savedPerson.number} to phonebook`)
            Person.find({}).then(allPersons => {
                response.json(allPersons)
            })
        })
        .catch(error => next(error))
})

// DELETE
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// PUT
app.put('/api/persons/:id', (request, response, next) => {

    const { name, number } = request.body

    Person.findByIdAndUpdate(request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})