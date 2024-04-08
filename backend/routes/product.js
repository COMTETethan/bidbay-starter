import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'
import user from '../orm/models/user.js'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  try {
  let products = await Product.findAll({
    include: [
      {
        model: User,
        as: 'seller',
      },
      {
        model: Bid,
        as: 'bids',
        include: {
          model: User,
          as: 'bidder'
        }
      }
    ]
  });
  if(!products) {
    res.status(404).json({error: 'Product not found !'})
  } else {
    res.status(200).json(products)
  }
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Internal Server Error !'})
}
})

router.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params

  try {
  let product = await Product.findByPk(productId,{
    include: [
      {
        model: User,
        as: 'seller',
      },
      {
        model: Bid,
        as: 'bids',
        include: {
          model: User,
          as: 'bidder'
        }
      }
    ]
});

  if(!product) {
    res.status(404).json({error: 'Product not found !'})
  } else {
    res.status(200).json(product)
  }
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Internal Server Error !'})
}
})


router.post('/api/products', authMiddleware, async (req, res) => {
  try {
    if(req.user.id === null) {
      return res.status(401).json({error: 'Unauthorized !'})
    }
    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body;
    if (!name || !description || !pictureUrl || !category || !originalPrice || !endDate) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: ['name', 'description', 'pictureUrl', 'category', 'originalPrice', 'endDate'] });
    }

    const sellerId = req.user.id; 
    const product = await Product.create({ name, description, category, originalPrice, pictureUrl, endDate, sellerId });
    
    return res.status(201).json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error !' });
  }
});

router.put('/api/products/:productId', authMiddleware, async (req, res, next) => {
  try {

    if(req.user.id === null) {
      return res.status(401).json({error: 'Unauthorized !'})
    }

    const productId = req.params.productId;
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const allow = req.user.admin === true || product.sellerId === req.user.id;
    if (!allow) {
      return res.status(403).json({ error: 'User not allowed to update this product !' });
    }

    if (!req.body || !req.body.name || !req.body.description || !req.body.category ||
        !req.body.originalPrice || !req.body.pictureUrl || !req.body.endDate) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: ['name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate'] });
    }

    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body;
    await product.update({ name, description, category, originalPrice, pictureUrl, endDate });

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/api/products/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params
  const product = await Product.findByPk(productId, { attributes: ['id', 'name', 'description', 'category', 'originalPrice', 'pictureUrl', 'endDate', 'sellerId'] });


  if(req.user.id === null) {
    return res.status(401).json({error: 'Unauthorized !'})
  }
  
  if(!product) {
    return res.status(404).json({error: 'Product not found !'})
  } 

  const allow = req.user.admin === true || product.sellerId === req.user.id;
  if (!allow) {
    return res.status(403).json({ error: 'User not allowed to update this product !' });
  }

  await product.destroy()
  return res.status(204).json({message: 'Product deleted !'})
  

})

export default router
