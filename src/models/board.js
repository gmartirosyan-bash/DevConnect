const mongoose = require('mongoose')

const boardSchema = new mongoose.Schema({
  title: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  columns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Column'
    }
  ]
})

boardSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Board = mongoose.model('Board', boardSchema)

module.exports = Board