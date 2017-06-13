var express = require('express');
var router = express.Router();
var User = require('../models/users');


router.get('/',function(req,res,next){
	User.getAllUsers().then(function(users){
		
		users.forEach(function(user){
			if (user._id == req.session.user._id) {
				console.log(user._id);  // 过滤当前用户
			}
		})
		res.render('allusers', {  // 渲染posts
        users: users// 传递数据ejs模版里面便利 文章模版 
      });
	})	
})

module.exports = router;


/*

res.render('posts', {  // 渲染posts
        posts: posts// 传递数据ejs模版里面便利 文章模版 
      });
*/