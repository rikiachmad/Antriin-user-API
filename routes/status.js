const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Admin = require('../models/Admin');
const Status = require('../models/Status');

// @route   POST api/status
// @desc    Add initial status
// @access  private
router.post(
    '/',
    auth,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { status } =
        req.body;
  
      try {
        let table = new Status({
          status
        });
  
        const newTable = await table.save();

        res.json(newTable);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

// @route   GET api/status
// @desc    Get all status
// @access  Public
router.get('/', async (req, res) => {
    try {
      const status = await Status.find();
      res.json(status);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route     PUT api/status
// @desc      Update status
// @access    Private
router.put('/', [auth, check('status', 'Please add status').not().isEmpty()], async (req, res) => {
    const { status } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    // Build contact object
    const statusFields = {};
    if (status) statusFields.status = status;
  
    try {
      let admin = await Admin.findById(req.user.id).select('-password');;
      let oneStatus = await Status.find();
      console.log(oneStatus[0].id);
      if (!admin) return res.status(404).json({ msg: 'Not authorized' });
  
      const newStatus = await Status.findByIdAndUpdate(
        oneStatus[0].id,
        { $set: statusFields },
        { new: true }
      );
  
      res.json(newStatus);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  module.exports = router;