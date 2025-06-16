const mongoose = require('mongoose')

const columnSchema = new mongoose.Schema({
  name: String,
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    }
  ]
})

columnSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Column = mongoose.model('Column', columnSchema)

module.exports = Column