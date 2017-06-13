var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页 
router.get('/', function(req, res, next) {
  res.render('signin');  // ---- 渲染signin
});

// POST /signin 用户登录
router.post('/', function(req, res, next) {  // <form class="ui form segment" method="post">.
  var name = req.fields.name;  //<input placeholder="用户名" type="text" name="name">
  var password = req.fields.password;  //<input placeholder="密码" type="password" name="password">

  console.log('name:---'+name+"password:---"+password);

  // UserModel.getUserByName(name).then(function(user){
  //   if (!user) {
  //       req.flash('error','用户不存在')
  //       return res.redirect('back')
  //     }

  //   // 匹配
  //   if (user.password !== shar1(password)) {
  //     req.flash('error','用户名或密码错误')
  //     return res.redirect('back');
  //   }
  //   // 匹配成功
  //   req.flash('success','登录成功')
  //   delete user.password
  //   req.session.user = user;
  //   res.redirect('/posts');
  // })

  // 判断数据库是否有name
  UserModel.getUserByName(name)
    .then(function (user) {
      if (!user) {
        req.flash('error', '用户不存在');
        return res.redirect('back');
      }
      // 检查密码是否匹配
      if (sha1(password) !== user.password) {
        req.flash('error', '用户名或密码错误');
        return res.redirect('back');
      }
      req.flash('success', '登录成功');
      // 用户信息写入 session
      delete user.password;
      req.session.user = user;
      // 跳转到主页
      res.redirect('/posts');
    })
    .catch(next);
});

module.exports = router;
