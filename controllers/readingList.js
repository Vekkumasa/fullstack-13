const router = require('express').Router()
const { ReadingList, User } = require('../models')
const { tokenExtractor } = require('../util/tokenExtractor');

router.post('/', tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const readingList = await ReadingList.create({ userId: user.id, blogId: req.body.blogId })
    res.json(readingList)
  } catch (error) {
    res.status(404).send({ error: 'Error' });
  }
  
})

module.exports = router