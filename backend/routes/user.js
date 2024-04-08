import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    let user = await User.findByPk(userId,{
      include: [
        {
          model: Product,
          as: 'products',
        },
        {
          model: Bid,
          as: 'bids',
          include: {
            model: Product,
            as: 'product'
          }
        }
      ]
    });

    if(!user) {
      res.status(404).json({error: 'User not found !'})
    } else {
      res.status(200).json(user)
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Internal Server Error !'})
  }
})

export default router
