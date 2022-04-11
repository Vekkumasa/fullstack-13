const User = require('../models/user')

const validateUser = async (req, res, next) => {
  console.log('validateuser', req.decodedToken.id)
  const user = await User.findByPk(req.decodedToken.id)
  if (user.disabled) {
    return res.status(401).json({ error: 'User is disabled' })
  }
  next()
}

module.exports = { validateUser }