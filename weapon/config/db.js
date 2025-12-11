// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // 加载环境变量，固定写法，会读取项目根目录下的.env文件

// 从环境变量读取配置
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试连接池是否可用
async function testPoolConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接池创建成功！');
    connection.release(); // 释放连接（归还到连接池）
  } catch (error) {
    console.error('❌ 数据库连接池创建失败：', error.message);
    process.exit(1); // 连接失败则退出程序
  }
}

// 暴露连接池和测试函数
module.exports = {
  pool,
  testPoolConnection
};