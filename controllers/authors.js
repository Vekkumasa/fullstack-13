const router = require('express').Router()
const { Blog } = require('../models')
const { sequelize } = require('../util/db');

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    group: 'author',
    attributes: [
      'author',
      [sequelize.fn('sum', sequelize.col('likes')), 'likes'],
      [sequelize.fn('count', sequelize.col('id')), 'blogs']
    ],
  });
  res.json(blogs)
})

module.exports = router