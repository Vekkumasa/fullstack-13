const router = require('express').Router()
const { ReadingList, User } = require('../models')
const { tokenExtractor } = require('../util/tokenExtractor');

const readingListFinder = async (req, res, next) => {
  req.readingList = await ReadingList.findByPk(req.params.id)
  next()
}

router.post('/', tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const readingList = await ReadingList.create({ userId: user.id, blogId: req.body.blogId })
    res.json(readingList)
  } catch (error) {
    res.status(404).send({ error: 'Error' });
  }
})

router.put('/:id', readingListFinder, tokenExtractor, async (req, res) => {
  if (req.readingList) {
    try {
      const user = await User.findByPk(req.decodedToken.id)

      if (user.id !== req.readingList.userId) {
        res.status(404).send({ error: 'You can only change read status of your own blogs' });
      }
      
      req.readingList.read = req.body.read
      req.readingList.save()

      res.json(req.readingList)
    } catch (error) {
      res.status(404).send({ error: 'Error at updating readinglist' });
    }
  }
  
})

module.exports = router