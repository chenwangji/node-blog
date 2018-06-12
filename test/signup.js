const path = require('path')
const assert = require('assert')
const request = require('supertest')
const app = require('../index')
const User = require('../lib/mongo').User

const testName1 = 'testName1'
const testName2 = 'testName2'
describe('signup', () => {
  describe('POST/signup', () => {
    const agent = request.agent(app)
    beforeEach(done => {
      // 创建一个用户
      User.create({
        name: testName1,
        password: '123456',
        avatar: '',
        gender: 'x',
        bio: ''
      })
        .exec()
        .then(() => {
          done()
        })
        .catch(done)
    })

    afterEach(done => {
      // 删除测试用户
      User.deleteMany({ name: { $in: [testName1, testName2] } })
        .exec()
        .then(() => {
          done()
        })
        .catch(done)
    })

    after(done => {
      process.exit()
    })

    // 用户名错误的情况
    it('wrong name', done => {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.jpeg'))
        .field({ name: '' })
        .redirects()
        .end((err, res) => {
          if (err) return done(err)
          assert(res.text.match(/名字请限制在 1-10 个字符/))
          done()
        })
    })

    // 性别错误的情况
    it('wrong gender', done => {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.jpeg'))
        .field({ name: testName2, gender: 'a' })
        .redirects()
        .end((err, res) => {
          if (err) return done(err)
          assert(res.text.match(/性别只能是 m、f 或 x/))
          done()
        })
    })

    // other params cases test ...

    // 用户名被占用的情况
    it('duplicate name', done => {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.jpeg'))
        .field({ name: testName1, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .redirects()
        .end((err, res) => {
          if (err) return done(err)
          assert(res.text.match(/用户名已被占用/))
          done()
        })
    })

    // 注册成功的情况
    it('success', done => {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.jpeg'))
        .field({ name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .redirects()
        .end((err, res) => {
          if (err) return done(err)
          assert(res.text.match(/注册成功/))
          done()
        })
    })
  })
})
