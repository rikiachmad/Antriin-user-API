const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Queue = require('../models/Queue');
const { check, validationResult } = require('express-validator');

// @route   GET api/queues
// @desc    Get all queues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const queues = await Queue.find().select({ _id: 0, user: 0 });
    res.json(queues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/queues/:id
// @desc    Get single queue
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const queue = await Queue.find({ user: req.user.id });
    res.json(queue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/queues
// @desc    Add queue
// @access  Private
router.post(
  '/',
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    let userOne = await User.findOne({ id : req.user.id });
    let name = userOne.name;
    let address = userOne.address;
    let phone = userOne.phone;
    var num;
    var oldestQueue = await Queue.find().sort({ _id: -1 }).limit(1);
    if (oldestQueue.length) {
      num = oldestQueue[0].num + 1;
    } else num = 1;
    try {
      let checkUser = await Queue.findOne({ user: req.user.id });
      if(checkUser){
        return res.status(400).json({ msg: 'User already have queue' });
      }
      const newQueue = new Queue({
        name,
        address,
        phone,
        status,
        num,
        user: req.user.id,
      });

      const queue = await newQueue.save();

      res.json(queue);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/queues/:id
// @desc    Update queue
// @access  Private
router.put('/:id', (req, res) => {
  res.send('Update queue');
});

// @route   DELETE api/queues/:id
// @desc    Delete queue
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let queue = await Queue.findById(req.params.id);

    if(!queue) return res.status(404).json({ msg: 'Queue not found' });

    // Make sure user owns queue
    if(queue.user.toString() !== req.user.id){
      return res.status(404).json({ msg: 'Mot Authorized' });
    }

    await Queue.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Queue removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
