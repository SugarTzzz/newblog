var express = require('express');
var router = express.Router();
var PostModel = require('../models/posts');


router.get('/',function(req,res,next){
	console.log(req.session.user.avatar+"1");
	res.render('person',{
		user: req.session.user
	});
})

module.exports = router;


/*

res.render('posts', {  // 渲染posts
        posts: posts// 传递数据ejs模版里面便利 文章模版 
      });
*/