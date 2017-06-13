module.exports = {
  checkLogin: function checkLogin(req, res, next) {
    // 如果没有user 就是未登录
    if (!req.session.user) {
      req.flash('error', '未登录啊啊啊'); 
      // res.rediret 直接push到signin
      return res.redirect('/signin'); 
    }
    next();
  },


  checkNotLogin: function checkNotLogin(req, res, next) {
    // 如果是user 就是登录
    if (req.session.user) {
      req.flash('error', '已登录'); 
      return res.redirect('back');//返回之前的页面
    }
    next();
  }
};

