## 说明

本项目是学习 Node.js 后端开发的一个个人练手项目，是一个简易的博客。

技术上主要是用 express, 使用 [semantic-ui](https://github.com/semantic-org/semantic-ui/) 快速搭建 UI.

## 测试

- 使用 mocha 和 supertest 测试各个接口。
- 使用 istanbul 检测测试覆盖率。

## 部署

项目部署在云服务器上，可直接[访问](https://chenwangji-node-blog.herokuapp.com/)。

- 使用 [Mlab](https://mlab.com/) 云数据库存储 MongoDB 数据。
- 将项目部署到 [Heroku](https://www.heroku.com/home) 云服务器中。
- 使用 pm2 管理远程云服务器。

> 由于数据库和云服务器均在海外，访问可能较慢，必要时需要科学上网。


