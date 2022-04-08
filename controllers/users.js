const router = require('express').Router()
const { create } = require('lodash')
const { User, Blog } = require('../models')

const userFinderById = async (req, res, next) => {
  req.user = await User.findByPk(req.params.id)
  next()
}

const userFinderByUsername = async (req, res, next) => {
  req.user = await User.findOne({where: { username: req.params.username }})
  next()
}

router.get('/', async (req, res) => {
  const users = await User.findAll({ 
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  const { username, name } = req.body;
  try {
    const user = await User.create({ username, name });
    res.json(user);
  } catch (error) {
    res.status(500).send({
      error: `An error occured while trying to create a user: ${error.message}`
    });
  }
});

router.get('/:id', userFinderById, async (req, res) => {
  if (req.user) {
    res.json(req.user)
  } else {
    res.status(404).send({ error: 'User does not exist.' });
  }
})

router.put('/:username', userFinderByUsername, async (req, res) => {
  if (req.user) {
    req.user.username = req.body.username
    await req.user.save()
    res.json(req.user)
  } else {
    res.status(404).send({ error: 'User does not exist.' });
  }
})

module.exports = router