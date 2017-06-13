var config = require('config-lite');
var Mongolass = require('mongolass');
var mongolass = new Mongolass();
mongolass.connect(config.mongodb);

var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at 
// 这个是mongolass的库自带方法 mongolass.plugin('函数') 可以用来链条式
mongolass.plugin('addCreatedAt', {
  afterFind: function (results) {
    results.forEach(function (item) {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
    });
    return results;
  },
  afterFindOne: function (result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
    }
    return result;
  }
});

// user 模型 
exports.User = mongolass.model('User', {
  name: { type: 'string' },
  password: { type: 'string' },
  avatar: { type: 'string' },
  gender: { type: 'string', enum: ['m', 'f', 'x'] },
  bio: { type: 'string' },
  fansArray: { type: [Mongolass.Types.ObjectId]}
  // id------ 找到个用户。: 580d123123yeyey
});
exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

// 文章列表模型
exports.Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId }, // 作者---对用用户的id 在发表文章的时候就是 req.session.user._id;
  title: { type: 'string' },  // 标题
  content: { type: 'string' }, // 内容
  pv: { type: 'number' } // 浏览次数
  // 每个模型自带模型id---通过id 可以获取到某个 文章
});
exports.Post.index({ author: 1, _id: -1 }).exec();// 按创建时间降序查看用户的文章列表

// 评论模型
exports.Comment = mongolass.model('Comment', {
  author: { type: Mongolass.Types.ObjectId }, // 作者 
  content: { type: 'string' },  //内容
  postId: { type: Mongolass.Types.ObjectId } // 文章id
});
exports.Comment.index({ postId: 1, _id: 1 }).exec();// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Comment.index({ author: 1, _id: 1 }).exec();// 通过用户 id 和留言 id 删除一个留言
