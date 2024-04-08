import authMiddleware from '../middlewares/auth.js'
import { Bid, Product } from '../orm/index.js'
import express from 'express'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.delete('/api/bids/:bidId',authMiddleware, async (req, res) => {
  const { bidId } = req.params
  const bid = await Bid.findByPk(bidId, {
    include: [
      {
        model: Product,
        as: 'product'
      }
    ]
  });

  
  if(!bid) {
    return res.status(404).json({error: 'Product not found !'})
  } 

  const allow = req.user.admin === true || bid.bidderId === req.user.id;
  if (!allow) {
    return res.status(403).json({ error: 'User not allowed to update this product !' });
  }

  await bid.destroy()
  return res.status(204).json({message: 'Bid deleted !'})
   
})

router.post('/api/products/:productId/bids',authMiddleware, async (req, res) => {
  try {
    if(!req.user) {
      return res.status(401).json({error: 'Unauthorized !'})
    }

    const { productId } = req.params
    const { price } = req.body
    const bidderId = req.user.id

    const product = await Product.findByPk(productId)
    if(!product) {
      return res.status(404).json({error: 'Product not found !'})
    } 

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: ['price'] });
    }
    const date = new Date();

    const bid = await Bid.create({
      price,
      productId,
      bidderId,
      date
    });

    return res.status(201).json({
      id: bid.id,
      productId: bid.productId,
      price: bid.price,
      date: bid.createdAt,
      bidderId: bid.bidderId,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({error: 'Internal Server Error !'})
  }
})

export default router
