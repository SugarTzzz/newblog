var User = require('../lib/mongo').User;

module.exports = {
  // 注册一个用户
  create: function create(user) {
    return User.create(user).exec();
  },

  // 通过用户名获取用户信息
  // 作用在登录的时候 ，判断name 是否存在数据库，不存在说明无此账号
  // 同时返回一个 User
  getUserByName: function getUserByName(name) {
    return User
      .findOne({ name: name })
      .addCreatedAt()
      .exec();
  },

  //获取素有用户
  getAllUsers: function getAllUsers(){
    return User
      .find()
      .addCreatedAt()
      .exec();
  }

};
