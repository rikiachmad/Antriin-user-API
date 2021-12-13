const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Queue = require('../models/Queue');
const Admin = require('../models/Admin');
const { check, validationResult } = require('express-validator');

// @route   GET api/queues
// @desc    Get all queues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const queues = await Queue.find().select();
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
  [
    auth,
    check('name', 'Please add name').not().isEmpty(),
    check('address', 'Please add address').not().isEmpty(),
    check('phone', 'Please add phone').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    let checkUserId = await User.findById(req.user.id).select('-password');
    let checkAdminId = await Admin.findById(req.user.id).select('-password');
    if(!checkUserId && !checkAdminId){
      return res.status(400).json({ msg: 'User not found' });
    }
    const { status } = req.body;

    var userOne;
    var newname;
    var newaddress;
    var newphone;
    if(checkAdminId){
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, address, phone } = req.body;
      newname = name;
      newaddress = address;
      newphone = phone;
    }
    else{
      userOne = await User.findById(req.user.id);
      newname = userOne.name;
      newaddress = userOne.address;
      newphone = userOne.phone;
    }
    var num;
    var oldestQueue = await Queue.find().sort({ _id: -1 }).limit(1);
    if (oldestQueue.length) {
      num = oldestQueue[0].num + 1;
    } else num = 1;

    try {
      let checkUser = await Queue.findOne({ user: req.user.id });
      if(checkUser && checkUserId){
        return res.status(400).json({ msg: 'User already have queue' });
      }
      const newQueue = new Queue({
        name: newname,
        address: newaddress,
        phone: newphone,
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
router.put('/:id', [auth, check('status', 'Please add status').not().isEmpty()], async (req, res) => {
  const { status } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  // Build contact object
  const queueFields = {};
  if (status) queueFields.status = status;

  try {
    let admin = await Admin.findById(req.user.id).select('-password');;
    if (!admin) return res.status(404).json({ msg: 'Not authorized' });

    const checkQueue = await Queue.findById(req.params.id);
    if (!checkQueue) return res.status(404).json({ msg: 'Queue not found' });

    let queue = await Queue.findByIdAndUpdate(
      req.params.id,
      { $set: queueFields },
      { new: true }
    );

    res.json(queue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
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

// @route   DELETE api/queues/
// @desc    Delete all queues
// @access  Private
router.delete('/', auth, async (req, res) => {
  
  try {
    let admin = await Admin.findById(req.user.id).select('-password');;
    if (!admin) return res.status(404).json({ msg: 'Not authorized' });

    await Queue.deleteMany();

    res.json({ msg: 'Queue removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
