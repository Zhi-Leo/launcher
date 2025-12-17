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

// index.js（新增测试函数）
// 👉 测试 2：新增单条数据（对应 addWeaponSkin 功能）
async function testAddWeaponSkin() {
	console.log("===== 开始测试：新增单条数据 =====");
	// 测试用数据
	const testData = {
		name: "AK-47 | 火神 (崭新出厂)",
		baseWeapon: "AK-47",
		skinName: "火神",
		price: 1599.99,
		appearance: "崭新出厂",
		category: "武器皮肤",
		stock: 8,
	};
	try {
		await testPoolConnection();
		const result = await weaponSkinModel.addWeaponSkin(testData);
		console.log("新增成功！结果：", result);
		// 额外验证：查询刚新增的数据
		const newData = await weaponSkinModel.getWeaponSkinById(result.insertId);
		console.log("验证新增数据：", newData);
	} catch (error) {
		console.log("新增失败！原因：", error.message);
	}
	console.log("===== 测试结束：新增单条数据 =====\n");
}

// index.js（新增测试函数）
// 👉 测试 3：删除数据（对应 deleteWeaponSkin 功能）
async function testDeleteWeaponSkin() {
	console.log("===== 开始测试：删除数据 =====");
	try {
		await testPoolConnection();
		// 执行删除：这里的id需要跟数据库保持一致
		const result = await weaponSkinModel.deleteWeaponSkin(2);
		console.log("删除结果：", result);
	} catch (error) {
		console.log("删除失败！原因：", error.message);
	}
	console.log("===== 测试结束：删除数据 =====\n");
}

// 👉 测试 4：修改价格（对应 updateWeaponSkinPrice 功能）
async function testUpdateWeaponSkinPrice() {
	console.log("===== 开始测试：修改价格 =====");
	const testId = 3; // 实际存在的 ID
	const newPrice = 1799.99;
	try {
		await testPoolConnection();
		const result = await weaponSkinModel.updateWeaponSkinPrice(
			testId,
			newPrice
		);
		console.log("修改结果：", result);
	} catch (error) {
		console.log("修改失败！原因：", error.message);
	}
	console.log("===== 测试结束：修改价格 =====\n");
}

// 价格变更日志
// 👉 第4个功能：按 ID 修改价格（新增价格变动日志）
async function updateWeaponSkinPrice(id, newPrice) {
	if (!id) throw new Error("ID 不能为空");
	if (typeof newPrice !== "number" || newPrice < 0) {
		throw new Error("价格必须为非负数值");
	}

	// 新增：查询商品旧价格（修复类型问题）
	let oldPrice;
	try {
		const [oldData] = await pool.execute(
			"SELECT price FROM weapon_skins WHERE id = ?",
			[id]
		);
		if (oldData.length === 0) {
			throw new Error(`未找到 ID=${id} 的数据`);
		}
		// 关键修复：将数据库返回的价格转为 Number 类型（兼容 DECIMAL/BigInt）
		oldPrice = Number(oldData[0].price);
	} catch (error) {
		console.error(`❌ 修改 ID=${id} 价格失败：`, error.message);
		throw error;
	}

	try {
		const [result] = await pool.execute(
			"UPDATE weapon_skins SET price = ? WHERE id = ?",
			[newPrice, id]
		);
		if (result.affectedRows === 0) throw new Error(`未找到 ID=${id} 的数据`);

		// 核心新增：打印价格变动日志（已修复类型问题）
		const logTime = formatTime();
		// 确保 newPrice 也转为 Number（避免传入字符串类型的数字）
		const finalNewPrice = Number(newPrice);
		console.log(
			`[${logTime}] 管理员修改ID=${id}的商品价格：旧价格${oldPrice.toFixed(
				2
			)} → 新价格${finalNewPrice.toFixed(2)}`
		);

		return {
			success: true,
			message: `价格更新为 ${finalNewPrice.toFixed(2)} 元`,
			oldPrice: oldPrice.toFixed(2),
			newPrice: finalNewPrice.toFixed(2),
		};
	} catch (error) {
		console.error(`❌ 修改 ID=${id} 价格失败：`, error.message);
		throw error;
	}
}

// 新增：辅助函数 - 格式化时间为「YYYY-MM-DD HH:mm:ss」
function formatTime() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hour = String(date.getHours()).padStart(2, "0");
	const minute = String(date.getMinutes()).padStart(2, "0");
	const second = String(date.getSeconds()).padStart(2, "0");
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// index.js（新增测试函数）
// 👉 测试：修改库存（对应 updateWeaponSkinStock 功能）
async function testUpdateWeaponSkinStock() {
	console.log("===== 开始测试：修改库存 =====");
	const testId = 1; // 用实际存在的 ID
	const newStock = 15;
	try {
		await testPoolConnection();
		// 执行修改
		const result = await weaponSkinModel.updateWeaponSkinStock(
			testId,
			newStock
		);
		console.log("修改结果：", result);
	} catch (error) {
		console.log("修改失败！原因：", error.message);
	}
	console.log("===== 测试结束：修改库存 =====\n");
}

// 👉 执行当前测试（只运行这一个）
// testGetAllWeaponSkins(); //查询
testAddWeaponSkin(); //新增
// testDeleteWeaponSkin(); //删除
// testUpdateWeaponSkinPrice(); //修改价格
// updateWeaponSkinPrice(5, 1899); //修改价格运行日志  问题：修改 ID=5 价格失败： pool is not defined
// testUpdateWeaponSkinStock(); //修改库存
