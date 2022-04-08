const router = require('express').Router()
const User = require('../models/user')
const ReadingList = require('../models/readingList');
const Blog = require('../models/blog')

router.post('/', async (request, response) => {
  const body = request.body

})

module.exports = router