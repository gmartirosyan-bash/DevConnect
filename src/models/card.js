const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
  name: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  column: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Column',
      required: true
  },
  order: {
    type: Number,
    required: true
  }
})

cardSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Card = mongoose.model('Card', cardSchema)

module.exports = Card