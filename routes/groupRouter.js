const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth')
const groupCtrl  = require('../controllers/groupCtrl');
router.get('/groups', groupCtrl.getGroups,auth);
router.post('/groups/create', groupCtrl.createGroup,auth);
router.get('/groups/:groupId', groupCtrl.getaGroup,auth);
router.post('/groups/join/:groupId', auth,groupCtrl.joinaGroup);

module.exports = router;
