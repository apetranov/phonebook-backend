const mongoose = require('mongoose')


const url = process.env.MONGODB_URI;

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 5) {
    console.log('phonebook:');
    Person.find({}).then(result => {
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`);
      });
      mongoose.connection.close();
      process.exit(0); // Exit with success status
    }).catch(err => {
      console.error('Error fetching entries:', err);
      mongoose.connection.close();
      process.exit(1); // Exit with error status
    });
  } else {
    const name = process.argv[3];
    const number = process.argv[4];
  
    const newPerson = new Person({
      name: name,
      number: number
    });
  
    newPerson.save().then(result => {
      console.log(`Added ${name} with number ${number} to phonebook`);
      mongoose.connection.close();
      process.exit(0); // Exit with success status
    }).catch(err => {
      console.error('Error saving to database:', err);
      mongoose.connection.close();
      process.exit(1); // Exit with error status
    });
}