const { SECRET } = require('../util/config')
const jwt = require('jsonwebtoken')
const Session = require('../models/session')

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const decodedToken = jwt.verify(authorization.substring(7), SECRET)
      let token

      try {
         token = await Session.findOne({ where: { token: authorization.substring(7)} })
      } catch (error) {
        return res.status(401).json({ error: 'token invalid' })
      }

      if (token !== null) {
        req.decodedToken = decodedToken
      } else {
        return res.status(401).json({ error: 'token invalid' })
      }
    } catch (error){
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

module.exports = { tokenExtractor }