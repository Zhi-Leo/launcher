const express = require('express');
const path = require('path');
const tradeController = require('./controllers/tradeController');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件中间件
app.use(express.static(path.join(__dirname, 'public')));

// 路由配置
app.get('/', tradeController.getTradePage);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});