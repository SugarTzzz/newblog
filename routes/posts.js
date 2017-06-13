var express = require('express');
var router = express.Router();

var PostModel = require('../models/posts');
var CommentModel = require('../models/comments');
var checkLogin = require('../middlewares/check').checkLogin;


//GET: /posts/search/xxx
router.get('/search/:searchTitle',function(req,res,next){

  PostModel.getPostBySearch(req.params.searchTitle)
  .then(function(posts){
    if (posts.length){
    res.render('posts', {  // 渲染posts
        posts: posts// 传递数据ejs模版里面便利 文章模版 
      });
    } else {
        res.render('posts', {  // 渲染posts
        posts: posts// 传递数据ejs模版里面便利 文章模版 
      });
    }

  })
  .catch(next);
})

// GET: /create/new
router.get('/create/new', function(req, res, next) {
  console.log(req.url);
  var author = req.query.author;
// post是文章模型get到页面都是 渲染
  PostModel.getPosts(author)
    .then(function (posts) {       
      res.render('posts', {  // 渲染posts
        posts: posts// 传递数据
      });
    })
    .catch(next);
});
// GET /posts 所有用户或者特定用户的文章页
// GET /posts?author=xxx
router.get('/', function(req, res, next) {
  console.log(req.url);
  var author = req.query.author;   // xxx
// post是文章模型get到页面都是 渲染
  PostModel.getPosts(author)
    .then(function (posts) {       
      res.render('posts', {  // 渲染posts
        posts: posts// 传递数据ejs模版里面便利 文章模版 
      });
    })
    .catch(next);
});


// GET /posts/create 发表文章页
router.get('/create', checkLogin, function(req, res, next) {
  console.log(req.url);
  res.render('create');  // 渲染craete页面
});

// POST /posts 发表一篇文章  form表单 ／action=posts 路由为'/' 
// <input placeholder="密码" type="password" name="password"> 可以用req.fields来获取请求信息

router.post('/', checkLogin, function(req, res, next) {
    console.log("发表文章"+req.url);

  var author = req.session.user._id;  //唯一标识
  var title = req.fields.title;
  var content = req.fields.content;

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写内容');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }
  // 创建post 数据
  var post = {
    author: author,
    title: title,
    content: content,
    pv: 0
  };

  // 插入到数据库
  PostModel.create(post)
    .then(function (result) {
      /*
      { result: { ok: 1, n: 1 },
  ops: 
   [ { author: 58be6a7b90c6e37b37013d65,
       title: 'heheh',
       content: '哦喔喔喔23',
       pv: 0,
       _id: 58df5813f98d0c87c615959b } ],
  insertedCount: 1,
  insertedIds: [ , 58df5813f98d0c87c615959b ] }
      */

      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0];
      // req.flash('success', '发表成功');
      // 发表成功后跳转到该文章页.  GET: /potst/xxxxxxx 下面那个就是 post.id 是文章的id
      res.redirect(`/posts/${post._id}`); 
    })
    .catch(next);
});

// GET /posts/:postId 单独一篇的文章页

router.get('/:postId', function(req, res, next) {
  // 这里是get方法 参数接在 url后面
  console.log("url="+req.url+"获取文章信息");
  // 获取到postid
  var postId = req.params.postId;

  //Promise mogonlass再带promise。
  Promise.all([
    PostModel.getPostById(postId),// 获取文章信息
    CommentModel.getComments(postId),// 获取该文章所有留言
    PostModel.incPv(postId)// pv 加 1  刷新一次页面 浏览次数+1
  ])
  .then(function (result) {

    var post = result[0];
    var comments = result[1];
    if (!post) {
      throw new Error('该文章不存在');
    }
    // 渲染到post.ejs
    res.render('post', {
      post: post,  
      comments: comments
    });
  })
  .catch(next);
});

// GET /posts/:postId/edit 更新文章页 在post-content.ejs 文件直接post过来
router.get('/:postId/edit', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('该文章不存在');
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足');
      }
      // 渲染edit.ejs
      res.render('edit', {
        post: post
      });
    })
    .catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;
  var title = req.fields.title;
  var content = req.fields.content;

  PostModel.updatePostById(postId, author, { title: title, content: content })
    .then(function () {
      req.flash('success', '编辑文章成功');
      // 编辑成功后跳转到上一页
      res.redirect(`/posts/${postId}`);
    })
    .catch(next);
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.delPostById(postId, author)
    .then(function () {
      req.flash('success', '删除文章成功');
      // 删除成功后跳转到主页
      res.redirect('/posts');
    })
    .catch(next);
});

// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function(req, res, next) {
  console.log('创建一条留言'+req.url);

  var author = req.session.user._id;  // 当前用户的id
  
  var postId = req.params.postId;  // 这里的postid 应该就是 "/:postI" 
  var content = req.fields.content; //评论内容
  var comment = {
    author: author,  // 作何就是当前用户      ObjectId("58df54b198e06f83a42d8479"),
    postId: postId,  // post.id 是文章的id
    content: content // 内容
  };

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', '留言成功');
      // 留言成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function(req, res, next) {
  var commentId = req.params.commentId; // 每个删除对应一个 评论id
  var author = req.session.user._id;

  CommentModel.delCommentById(commentId, author)
    .then(function () {
      req.flash('success', '删除留言成功');
      // 删除成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

module.exports = router;
