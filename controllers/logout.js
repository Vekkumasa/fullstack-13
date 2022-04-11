const router = require('express').Router()
const Session = require('../models/session')
const { tokenExtractor } = require('../util/tokenExtractor')

router.delete('/', tokenExtractor, async (req, res) => {
  try {
    await Session.destroy({ where: { user_id: req.decodedToken.id }})
    res.status(200).json({ success: 'Logged out successfully' })
  } catch (error) {
    res.status(404).send({ error: 'Error during logout' });
  }
})

module.exports = router