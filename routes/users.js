const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

// @route   POST api/users
// @desc    Resgister a user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Please add name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, username, phone, address, dateOfBirth, password } =
      req.body;

    try {
      let checkEmail = await User.findOne({ email });
      let checkUsername = await User.findOne({ username });
      let checkPhone = await User.findOne({ phone });
      if (checkEmail) {
        return res.status(400).json({ msg: 'Email already exists' });
      }
      if (checkUsername) {
        return res.status(400).json({ msg: 'Username already exists' });
      }
      if (checkPhone) {
        return res.status(400).json({ msg: 'Phone number already exists' });
      }

      let user = new User({
        name,
        email,
        username,
        phone,
        address,
        dateOfBirth,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 36000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
