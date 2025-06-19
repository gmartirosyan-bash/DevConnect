const unknownEndpoint = (req, res) => {
  res.status(404).send('<h1>Error: Unknown Endpoint</h1>')
}

module.exports = unknownEndpoint