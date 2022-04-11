const router = require('express').Router()
const { User, Blog, ReadingList } = require('../models')
const { Op, Sequelize } = require('sequelize')

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

router.get('/:id', async (req, res) => {
  try {
      let filter = false;
      let booleanFilter
    if (req.query.read) {
      booleanFilter = req.query.read === "true"
      filter = true;
    }

    const readingList = await ReadingList.findAll({ where: { userId: req.params.id }})
    let listToShow
    if (filter) {
      listToShow = readingList.filter(blog => blog.dataValues.read === booleanFilter)
    } else {
      listToShow = readingList
    }
    
    console.log(listToShow)
    const user = await User.findByPk(req.params.id, { 
      attributes: { exclude: [''] },
      //where,
      include:[{
          model: Blog,
          attributes: { exclude: ['userId'] }
        },
        {
          model: Blog,
          as: 'listedBlogs',       
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
        listedBlogs: listToShow
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