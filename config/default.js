module.exports = {
  port: 3000,
  session: {
    secret: 'myblog',
    key: 'myblog',
    maxAge: 30000000
  },
  mongodb: 'mongodb://localhost:27017/myblog'
}
