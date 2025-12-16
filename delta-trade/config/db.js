const mysql = require("mysql2/promise");

// 数据库连接配置
const dbConfig = {
	host: "localhost",
	user: "root", // 你的MySQL用户名
	password: "SQL123456", // 你的MySQL密码
	database: "delta_trade", // 数据库名
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试连接
async function testConnection() {
	try {
		const [rows] = await pool.execute("SELECT 1");
		console.log("数据库连接成功");
	} catch (err) {
		console.error("数据库连接失败:", err);
		process.exit(1);
	}
}

testConnection();

module.exports = pool;
