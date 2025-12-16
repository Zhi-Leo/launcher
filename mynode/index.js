// index.js
const { testPoolConnection } = require("./config/db");
const weaponSkinModel = require("./model/weaponSkinModel");

// 👉 测试 1：查询所有数据（对应 getAllWeaponSkins 功能）
async function testGetAllWeaponSkins() {
	console.log("===== 开始测试：查询所有数据 =====");
	try {
		// 先测试连接池
		await testPoolConnection();
		// 调用查询函数
		const result = await weaponSkinModel.getAllWeaponSkins();
		console.log("查询成功！结果：");
		console.log(result.length > 0 ? result : "暂无数据");
	} catch (error) {
		console.log("查询失败！原因：", error.message);
	}
	console.log("===== 测试结束：查询所有数据 =====\n");
}

// 👉 执行当前测试（只运行这一个）
testGetAllWeaponSkins();
