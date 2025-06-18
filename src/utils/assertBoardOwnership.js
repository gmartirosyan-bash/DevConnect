const Board = require('../models/board')

const assertBoardOwnership = async (boardId, userId) => {
  const board = await Board.findById(boardId)
  if(!board){
    const err = new Error('Board not found')
    err.status = 404
    throw err
  }
  if (board.owner.toString() !== userId) {
    const err = new Error('You do not own this board')
    err.status = 403
    throw err
  }
  return board
}

module.exports = assertBoardOwnership