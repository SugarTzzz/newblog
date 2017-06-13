module.exports = function (app) {
  // 如果输入的是localhost:3000 直接跳转到localhost:3000/posts
  app.get('/', function (req, res) {
    res.redirect('/posts');
  });

  // 路由 引入signup ,signin ,signout,posts 
  app.use('/signup', require('./signup'));
  app.use('/signin', require('./signin'));
  app.use('/signout', require('./signout'));
  app.use('/posts', require('./posts'));
  // 搜索
  app.use('/search',require('./search'));
  // 个人资料
  app.use('/person',require('./person'));
  // 所有用户
  app.use('/allusers',require('./allusers'));
  
  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.status(404).render('404');
    }
  });
};
