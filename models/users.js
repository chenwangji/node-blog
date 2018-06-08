const User = require('../lib/mongo').User

module.exports = {
  // 注册一个用户
  create (user) {
    return User.create(user).exec()
  },
  getUserByName (name) {
    return User
      .findOne({ name })
      .addCreatedAt() // addCreatedAt 自定义插件（通过 _id 生成时间戳）
      .exec()
  }
}
