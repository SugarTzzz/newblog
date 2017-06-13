var express = require('express');
var router = express.Router();
var PostModel = require('../models/posts');

router.get('/',function(req,res){
	res.render('search')
})

router.post('/',function(req,res,next){
	// req.flash 只能伴随res.redirect
	var msg = ""
	PostModel.getPostBySearch(req.fields.search).then(function(posts){
		msg = posts.length > 0 ? "搜索成功" : "搜索结果为空"
        req.flash('success',msg)
        res.redirect(`/posts/search\/${req.fields.search}`)
    })

	// 直接在post的请求的时候 直接查找数据库
})

module.exports = router;