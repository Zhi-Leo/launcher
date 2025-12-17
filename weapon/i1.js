const { testPoolConnection } = require("./config/db");
const w1 = require("./model/w1");

async function testWeaponSkin1() {
	// 第一步：测试数据库连接
	try {
		await testPoolConnection();
		console.log("数据库连接成功！");
	} catch (error) {
		console.log("数据库连接失败，终止操作：", error.message);
		return;
	}
	console.log("数据库连接成功！");
}
async function testWeaponSkin() {
	const testData = {
		name: "AK-47 | 火神 (崭新出厂)",
		baseWeapon: "AK-47",
		price: 1599.99,
		appearance: "崭新出厂",
		category: "武器皮肤",
		quality: "全息",
		isCollectible: 1,
		imgUrl: "http://example.com/ak47_fire_god.jpg",
		stock: 8,
	};
	try {
		await testPoolConnection();
		const result = await w1.getAllWeaponSkin(testData);
		console.log("新增成功！结果为：", result);
	} catch (error) {
		console.log("新增失败！原因：", error.message);
	}
}

async function deletemodele(id) {
	try {
		await testPoolConnection();
		const result = await w1.deleteWeaponSkin(id);
		console.log("删除成功！结果为：", result);
	} catch (error) {
		console.log("删除失败！原因：", error.message);
	}
}

async function updateWeaponSkinPrice(price, id) {
	try {
		await testPoolConnection();
		const result = await w1.updateWeaponSkinPrice(price, id);
		console.log("更新成功！结果为：", result);
	} catch (error) {
		console.log("更新失败！原因：", error.message);
	}
}

// testWeaponSkin1();
// testWeaponSkin(); //新增
// deletemodele(id); // 删除
// updateWeaponSkinPrice(99, 25);
