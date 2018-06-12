const marked = require('marked')
const Comment = require('../lib/mongo').Comment

Comment.plugin('contentToHtml', {
  afterFind (comments) {
    return comments.map(comment => {
      comment.content = marked(comment.content)
      return comment
    })
  }
})

module.exports = {
  create (comment) {
    return Comment.create(comment).exec()
  },
  getCommentById (commentId) {
    return Comment.findOne({_id: commentId}).exec()
  },
  delCommentById (commentId) {
    return Comment.deleteOne({_id: commentId}).exec()
  },
  delCommentsByPostId (postId) {
    return Comment.deleteMany({ postId }).exec()
  },
  // 通过文章 id 获取该文章下所有留言，按留言创建时间升序
  getComments (postId) {
    return Comment
      .find({ postId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec()
  },
  // 通过文章 id 获取该文章下留言数
  getCommentsCount (postId) {
    return Comment.count({ postId }).exec()
  }
}
