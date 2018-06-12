const marked = require('marked')
const Post = require('../lib/mongo').Post
const CommentModel = require('./comments')

// 自定义插件 - 将 post 的 content 从 markdown 转为 html
Post.plugin('contentToHtml', {
  afterFind (posts) {
    return posts.map(post => {
      post.content = marked(post.content)
      return post
    })
  },
  afterFindOne (post) {
    if (post) {
      post.content = marked(post.content)
    }
    return post
  }
})

// 自定义插件 - 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
  afterFind (posts) {
    return Promise.all(posts.map(post => { // TODO
      return CommentModel.getCommentsCount(post._id).then(commentsCount => {
        post.commentsCount = commentsCount
        return post
      })
    }))
  },
  afterFindOne (post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(count => {
        post.commentsCount = count
        return post
      })
    }
    return post
  }
})

module.exports = {
  // 创建一篇文章
  create (post) {
    return Post.create(post).exec()
  },
  // 通过文章 id 获取一篇文章
  getPostById (postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' }) // https://segmentfault.com/a/1190000002727265
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },
  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
  getPosts (author) {
    const query = {}
    if (author) {
      query.author = author
    }
    return Post
      .find(query)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },
  // 通过文章 id 给 pv 加 1
  incPv (postId) {
    return Post
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec()
  },
  // 通过文章 id 获取一篇原生文章（没有经过 markdown 转为 HTML）
  getRawPostById (postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .exec()
  },
  // 通过文章 id 更新一篇文章
  updatePostById (postId, data) {
    return Post
      .update({ _id: postId }, { $set: data })
      .exec()
  },
  // 通过文章 id 删除一篇文章
  delPostById (postId) {
    return Post
      .deleteOne({ _id: postId })
      .exec()
      .then(res => {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {
          return CommentModel.delCommentsByPostId(postId)
        }
      })
  }
}
