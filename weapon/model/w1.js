const { pool } = require("../config/db");

// 👉 第1个功能：查询所有武器
async function getAllWeaponSkins() {
	try {
		const [rows] = await pool.execute(
			"SELECT * FROM weapon_skins ORDER BY id DESC"
		);
		return rows;
	} catch (error) {
		console.error("❌ 查询所有数据失败：", error.message);
		throw error;
	}
}
async function getAllWeaponSkin(weaponSkin) {
	// const [rows] = await pool.execute("SELECT * FROM weapon_skins ORDER BY id DESC");
	// return rows;
	// 定义接收用户填写的变量
	console.log(weaponSkin);
	try {
		const {
			name,
			baseWeapon,
			price,
			appearance,
			category,
			quality = null,
			isCollectible = 0,
			imgUrl = null,
			stock,
		} = weaponSkin;

		// 必传字段校验
		if (
			!name ||
			!baseWeapon ||
			!price ||
			!appearance ||
			!category ||
			stock === undefined
		) {
			throw new Error(
				"必传字段：name/baseWeapon/price/appearance/category/stock 不能为空"
			);
		}

		const [results] = await pool.execute(
			`INSERT INTO weapon_skins 
       (name, baseWeapon, price, appearance, category, quality, isCollectible, imgUrl, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				name,
				baseWeapon,
				price,
				appearance,
				category,
				quality,
				isCollectible,
				imgUrl,
				stock,
			]
		);

		return {
			success: true,
			insertId: results.insertId,
			message: "武器皮肤新增成功",
		};
	} catch (error) {
		console.error("❌ 新增武器皮肤失败：", error.message);
		throw error;
	}
}

// 删除
async function deleteWeaponSkin(id) {
	try {
		const [results] = await pool.execute(
			"DELETE FROM weapon_skins WHERE id = ?",
			[id]
		);
		if (id != null) {
			return { success: true, message: "武器皮肤删除成功" };
		} else {
			throw new Error("删除失败，ID不能为空");
		}
	} catch (error) {
		console.error("❌ 删除武器皮肤失败：", error.message);
		throw error;
	}
}

async function updateWeaponSkinPrice(price, id) {
	try {
		const [results] = await pool.execute(
			`UPDATE weapon_skins SET price = ? WHERE id = ?`,
			[price, id]
		);
		return { success: true, message: "武器价格更新成功" };
		console.log(results);
	} catch (error) {
		console.error("❌ 更新武器价格失败：", error.message);
		throw error;
	}
}

module.exports = {
	getAllWeaponSkins,
	getAllWeaponSkin,
	deleteWeaponSkin,
	updateWeaponSkinPrice,
};
