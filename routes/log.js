var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('What did you expect ?');
});

module.exports = router;