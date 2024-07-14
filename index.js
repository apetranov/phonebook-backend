const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config();
const Person = require('./models/person')

app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('dist'))
app.use(express.json());
app.use(bodyParser.json());

const mongoose = require('mongoose')

const url = process.env.MONGODB_URI;

mongoose.set('strictQuery',false)


mongoose.connect(url)


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch((error) => {
        console.error('Error fetching persons:', error);
        response.status(500).json({ error: 'Internal server error' });
      });
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
  
    if (body.name === undefined) {
      return response.status(400).json({ error: 'name missing' })
    }

    if (body.number === undefined) {
        return response.status(400).json({ error: 'number missing' })
    }
  
    const person = new Person({
      name: body.name,
      number: body.number,
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// PUT /api/persons/:id - Update person by ID
app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  const { name, number } = request.body;

  const personToUpdate = {
    name: name,
    number: number,
  };

  // Check if there's already a person with the same name
  Person.findOne({ name: name })
    .then(existingPerson => {
      if (existingPerson && existingPerson._id.toString() !== id) {
        // Update the existing person's number
        existingPerson.number = number;
        return existingPerson.save();
      } else {
        // Update the person identified by id
        return Person.findByIdAndUpdate(id, personToUpdate, { new: true });
      }
    })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.get('/info', async (request, response) => {
  const currentDate = new Date()
  try {
    const persons = await Person.find({});
    const len = persons.length;

    response.send(`<p>There are ${len} people in the phonebook.</p><p>${currentDate}</p>`);
  } catch (error) {
    console.error(error);
    response.status(500).send('Internal Server Error');
  }
});


// app.get('/info', (request, response) => {
//     const now = new Date()
//     response.send(`<p>Phonebook has info for ${persons.length} people</p>
//         <p>${now}</p>  
//         `)
// })

// app.get('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     const person = persons.find(person => person.id === id)
//     if (person) {
//         response.json(person)
//     } else {
//         response.status(404).end()
//     }
// })

// app.delete('/api/persons/:id', (request, response) => {
//     const id = Number(request.params.id)
//     persons = persons.filter(person => person.id !== id)

//     response.status(204).end()
// })

// const generateId = () => {
//     return Math.floor(Math.random() * 10000) + Date.now();
// };

// const nameExists = (name) => {
//     return persons.some(person => person.name === name);
// };

// app.post('/api/persons', (request, response) => {
//     const body = request.body

//     if (!body.name || !body.number) {
//         return response.status(400).json({
//             error: 'name and/or number missing'
//         })
//     }

//     if (nameExists(body.name)) {
//         return response.status(400).json({
//             error: 'name must be unique'
//         })
//     }

//     const person = {
//         id: generateId(),
//         name: body.name,
//         number: body.number,
//     }

//     persons = persons.concat(person)

//     response.json(person)

// })

// app.put('/api/persons/:id', (req, res) => {
//     const id = Number(req.params.id)
//     const body = req.body
  
//     const person = persons.find(p => p.id === id)
//     if (!person) {
//       return res.status(404).json({ 
//         error: 'person not found' 
//       })
//     }
  
//     const updatedPerson = { ...person, number: body.number }
//     persons = persons.map(p => p.id !== id ? p : updatedPerson)
  
//     res.json(updatedPerson)
// })

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})