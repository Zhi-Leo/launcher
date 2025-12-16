// model/weaponSkinModel.js
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

// 只暴露当前开发的功能
module.exports = {
	getAllWeaponSkins,
};
