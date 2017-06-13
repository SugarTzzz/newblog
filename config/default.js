module.exports = {
  // 端口号
  port: 3333,   
  // 配置信息
  session: {
    secret: 'myblog',
    key: 'myblog',
    maxAge: 2592000000
  },
  // mongodb 地址
  mongodb: 'mongodb://localhost:27017/myblog'
};
