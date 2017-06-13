var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signup');
});

// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
  // 获取post 请求数据,如果获取不到 请在app.js 中检查 中间件顺序
  var name = req.fields.name;   //<input placeholder="用户名" type="text" name="name">
  var gender = req.fields.gender;  //<select class="ui compact selection dropdown" name="gender">
  var bio = req.fields.bio;  //        <textarea name="bio" rows="5" v-model="user.bio"></textarea>
  var avatar = req.files.avatar.path.split(path.sep).pop();  //  <input type="file" name="avatar">
  var password = req.fields.password;   //<input placeholder="密码" type="password" name="password">
  var repassword = req.fields.repassword;  //<input placeholder="重复密码" type="password" name="repassword">


  // try{
  //   // name
  //   if (name.length>10 || name.length<5) {
  //     throw new Error('账户字数限制5-10字');
  //   }
  //   if (['m','f','x'].indexOf(gender) === -1) {
  //     throw new Error('性别只能是m,f,x')
  //   }
  //    if (!(bio.length >= 1 && bio.length <= 30)) {
  //     throw new Error('个人简介请限制在 1-30 个字符');
  //   }
  //   if (!req.files.avatar.name){
  //     throw new Error('缺少头像')
  //   }



  // }catch(e){

  //   req.flash('error',e.message)
  //   return res.redirect('/signup')
  // }

  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('名字请限制在 1-10 个字符');
    }
       
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('个人简介请限制在 1-30 个字符');
    }

    // 一定要判断avatar.name 而不是avatar
    if (!req.files.avatar.name) {
      throw new Error('缺少头像');
    }
    if (password.length < 6) {
      throw new Error('密码至少 6 个字符');
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致');
    }
  } catch (e) {
    // 注册失败，异步删除上传的头像
    // 上面如果出现直接到这里 throw new Error  直接catch错误 
    fs.unlink(req.files.avatar.path);
    // 直接flash。通知 error  e.message 是报错信息
    req.flash('error', e.message);
    return res.redirect('back');
  }

  // 明文密码加密
  password = sha1(password);

  // 待写入数据库的用户信息
  var user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  };
  // 用户信息写入数据库
  UserModel.create(user)
    .then(function (result) {
      console.log("result="+result);
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0];
      // 将用户信息存入 session
      delete user.password;
      req.session.user = user;
      // 写入 flash
      req.flash('success', '注册成功');
      // 跳转到首页
      res.redirect('/posts');
    })
    .catch(function (e) {  
      // 为啥会catch 因为这里schema 谁name 是唯一的 所以出现重复就会catch
      // 注册失败，异步删除上传的头像
      fs.unlink(req.files.avatar.path);
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', '用户名已被占用');
        return res.redirect('/signup');
      }
      next(e);
    });
});

module.exports = router;
