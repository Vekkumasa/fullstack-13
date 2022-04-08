const router = require('express').Router()
const { Blog, User } = require('../models')
const { Op, Sequelize } = require('sequelize')
const { tokenExtractor } = require('../util/tokenExtractor');

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  let where = {}

  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.match]: Sequelize.fn('to_tsquery', req.query.search)
          }
        },
        {
          author: {
            [Op.match]: Sequelize.fn('to_tsquery', req.query.search)
          }
        }
      ]
    }
    
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [
      ['likes', 'DESC'],
  ],
  })
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id)
  const blog = await Blog.create({...req.body, userId: user.id })
  res.json(blog)
})

router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog)
  } else {
    res.status(404).send({ error: 'Blog does not exist.' });
  }
})

router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
  console.log(req.blog, req.decodedToken)
  if (req.blog) {
    if (req.decodedToken.id === req.blog.userId) {
      await req.blog.destroy()
    } else {
      res.status(404).send({ error: 'Invalid credentials' });
    }   
  } else {
    res.status(404).send({ error: 'Blog does not exist.' });
  }
  res.status(204).end()
})

router.put('/:id', blogFinder, async (req, res) => { 
  if (req.blog) {
    req.blog.likes = req.body.likes
    await req.blog.save()
    res.json(req.blog)
  } else {
    res.status(404).send({ error: 'Blog does not exist.' });
  }
})

module.exports = router