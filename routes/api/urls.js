const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const UrlCheck = require('../../models/UrlCheck');
const UrlCheckHistory = require('../../models/UrlCheckHistory');
const urlCheckService = require('../../services/urlCheckService');

router.post(
  '/',
  [
    auth,
    [
      check('url', 'URL is required').not().isEmpty(),
      check('name', 'Name is required').not().isEmpty(),
      check('interval', 'Interval is required').isInt({ gt: 0 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { url, name, interval } = req.body;

    try {
      let urlCheck = new UrlCheck({
        user: req.user.id,
        url,
        name,
        interval
      });

      await urlCheck.save();

      urlCheckService.startUrlCheck(urlCheck);

      res.json(urlCheck);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.get('/', auth, async (req, res) => {
  try {
    const urlChecks = await UrlCheck.find({ user: req.user.id });
    res.json(urlChecks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const urlCheck = await UrlCheck.findById(req.params.id);

    if (!urlCheck) {
      return res.status(404).json({ msg: 'URL check not found' });
    }

    if (urlCheck.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(urlCheck);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'URL check not found' });
    }

    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const urlCheck = await UrlCheck.findById(req.params.id);

    if (!urlCheck) {
      return res.status(404).json({ msg: 'URL check not found' });
    }

    if (urlCheck.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    urlCheckService.stopUrlCheck(urlCheck);

    await urlCheck.remove();

    res.json({ msg: 'URL check removed' });
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'URL check not found' });
    }

    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { url, name, interval } = req.body;

  const urlCheckFields = {};

  if (url) urlCheckFields.url = url;
  if (name) urlCheckFields.name = name;
  if (interval) urlCheckFields.interval = interval;

  try {
    let urlCheck = await UrlCheck.findById(req.params.id);

    if (!urlCheck) {
      return res.status(404).json({ msg: 'URL check not found' });
    }

    if (urlCheck.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    urlCheck = await UrlCheck.findByIdAndUpdate(
      req.params.id,
      { $set: urlCheckFields },
      { new: true }
    );

    urlCheckService.updateUrlCheck(urlCheck);

    res.json(urlCheck);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'URL check not found' });
    }

    res.status(500).send('Server Error');
  }
});

router.get('/:id/history', auth, async (req, res) => {
  try {
    const urlCheck = await UrlCheck.findById(req.params.id);

    if (!urlCheck) {
      return res.status(404).json({ msg: 'URL check not found' });
    }

    if (urlCheck.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const urlCheckHistory = await UrlCheckHistory.find({ urlCheck: req.params.id });

    res.json(urlCheckHistory);
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'URL check not found' });
    }

    res.status(500).send('Server Error');
  }
});

module.exports = router;
