var express = require('express');
var router = express.Router();
var checkLogin = require('../middlewares/check').checkLogin;

// GET /posts
router.get('/',function(req,res){
	req.session.user = null
	req.flash('success','退出成功');
	res.redirect('/signin');
})

module.exports = router;