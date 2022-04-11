const router = require('express').Router()
const { create } = require('lodash')
const { User, Blog, ReadingList } = require('../models')

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
    include:[{
          model: Blog,
          attributes: { exclude: ['userId'] }
        },
        {
          model: Blog,
          as: 'listedBlogs',
          attributes: { exclude: ['userId']},
          through: {
            attributes: []
          },
        },
      ]  
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
/*
id: 2,
username: "martti@gmail.com",
name: "Martin Fowler",
createdAt: "2022-04-08T11:59:17.247Z",
updatedAt: "2022-04-08T11:59:17.247Z",
admin: null,
disabled: null,
blogs: [
listedBlogs: [
*/
router.get('/:id', async (req, res) => {
  try {
    const readingList = await ReadingList.findOne({ where: { userId: req.params.id }})
    console.log('readinglist:', readingList)
    const user = await User.findByPk(req.params.id, { 
      attributes: { exclude: [''] } ,
      include:[{
          model: Blog,
          attributes: { exclude: ['userId'] }
        },
        {
          model: Blog,
          as: 'listedBlogs',
          attributes: { exclude: ['userId', 'author', 'url', 'likes', 'year']},
          
          through: {
            attributes: []
          },
        },
      ]
    })
    if (user) {
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        updatedAd: user.updatedAt,
        blogs: user.blogs,
        listedBlogs: {
          id: readingList.id,
          read: readingList.read
        }
      })
    } else {
      res.status(404).send({ error: 'User does not exist.' });
    }
  } catch (error) {
    console.log('ERROR:', error.message);
    return res.status(500).send({ error: `Error: ${error.message}` });
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