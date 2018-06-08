const express = require('express')
const router = express.Router()

const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')
const checkLogin = require('../middlewares/check').checkLogin

// GET /posts 所有用户或者特定用户的文章页
// eg: GET /posts/?author=xxx
router.get('/', (req, res, next) => {
  const { author } = req.query

  PostModel.getPosts(author)
    .then(posts => {
      res.render('posts', { posts })
    })
    .catch(next)
})

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, (req, res, next) => {
  const author = req.session.user._id
  const { title, content } = req.fields

  // 参数校验
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  let post = {
    author,
    title,
    content
  }

  PostModel.create(post)
    .then(result => {
      // 此 post 是插入 mongodb 后的返回值，包含 _id
      post = result.ops[0]
      req.flash('success', '发表成功')
      // 跳转到文章页
      res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, (req, res, next) => {
  res.render('create')
})

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', (req, res, next) => {
  const { postId } = req.params

  Promise.all([
    PostModel.getPostById(postId),
    CommentModel.getComments(postId),
    PostModel.incPv(postId)
  ])
    .then(result => {
      const post = result[0]
      const comments = result[1]
      if (!post) {
        throw new Error('文章不存在')
      }
      res.render('post', { post, comments })
    })
    .catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, (req, res, next) => {
  const { postId } = req.params
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(post => {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足')
      }
      res.render('edit', { post })
    })
    .catch(next)
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, (req, res, next) => {
  const { postId } = req.params
  const author = req.session.user._id
  const { title, content } = req.fields

  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  PostModel.getRawPostById(postId)
    .then(post => {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('没有权限')
      }

      PostModel.updatePostById(postId, { title, content })
        .then(() => {
          req.flash('success', '编辑文章成功')
          res.redirect(`/posts/${postId}`)
        })
    })
})

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, (req, res, next) => {
  const { postId } = req.params
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(post => {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }

      PostModel.delPostById(postId)
        .then(() => {
          req.flash('success', '删除文章成功')
          res.redirect('/posts')
        })
    })
    .catch(next)
})

module.exports = router
