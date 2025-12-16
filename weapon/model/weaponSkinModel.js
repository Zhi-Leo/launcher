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

// model/weaponSkinModel.js（新增）
// 👉 第2个功能：新增单条数据
async function addWeaponSkin(weaponSkin) {
	const { name, baseWeapon, skinName, price, appearance, category, stock } =
		weaponSkin;
	try {
		const [result] = await pool.execute(
			`INSERT INTO weapon_skins 
       (name, baseWeapon, skinName, price, appearance, category, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				name,
				baseWeapon,
				skinName || "",
				price,
				appearance || "未知",
				category || "武器皮肤",
				stock || 0,
			]
		);
		return {
			success: true,
			insertId: result.insertId,
			message: "新增成功",
		};
	} catch (error) {
		console.error("❌ 新增数据失败：", error.message);
		throw error;
	}
}

// model/weaponSkinModel.js（新增）
// 👉 第3个功能：按 ID 删除数据
async function deleteWeaponSkin(id) {
	if (!id) throw new Error("ID 不能为空");

	try {
		const [result] = await pool.execute(
			"DELETE FROM weapon_skins WHERE id = ?",
			[id]
		);
		if (result.affectedRows === 0) throw new Error(`未找到 ID=${id} 的数据`);
		return { success: true, message: `ID=${id} 数据已删除` };
	} catch (error) {
		console.error(`❌ 删除 ID=${id} 失败：`, error.message);
		throw error;
	}
}

// model/weaponSkinModel.js（新增）
// 👉 第4个功能：按 ID 修改价格
async function updateWeaponSkinPrice(id, newPrice) {
	if (!id) throw new Error("ID 不能为空");
	if (typeof newPrice !== "number" || newPrice < 0) {
		throw new Error("价格必须为非负数值");
	}

	try {
		const [result] = await pool.execute(
			"UPDATE weapon_skins SET price = ? WHERE id = ?",
			[newPrice, id]
		);
		if (result.affectedRows === 0) throw new Error(`未找到 ID=${id} 的数据`);
		return { success: true, message: `价格更新为 ${newPrice} 元` };
	} catch (error) {
		console.error(`❌ 修改 ID=${id} 价格失败：`, error.message);
		throw error;
	}
}

// model/weaponSkinModel.js（新增）
async function updateWeaponSkinStock(id, newStock) {
	// 校验
	if (!id) throw new Error("ID 不能为空");
	if (typeof newStock !== "number" || newStock < 0) {
		throw new Error("库存必须为非负整数");
	}

	try {
		const [result] = await pool.execute(
			"UPDATE weapon_skins SET stock = ? WHERE id = ?",
			[newStock, id]
		);
		if (result.affectedRows === 0) {
			throw new Error(`未找到 ID=${id} 的数据`);
		}
		return {
			success: true,
			message: `库存更新为 ${newStock}`,
			affectedRows: result.affectedRows,
		};
	} catch (error) {
		console.error(`❌ 修改 ID=${id} 库存失败：`, error.message);
		throw error;
	}
}

// 👉 第5个功能：分页查询武器皮肤（支持筛选）
async function getWeaponSkinsWithPagination(options = {}) {
	const {
		page = 1, // 当前页码
		pageSize = 12, // 每页数量
		minPrice = null, // 最低价格
		maxPrice = null, // 最高价格
		appearance = [], // 外观筛选（数组）
		category = [], // 类别筛选（数组）
		quality = [], // 品质筛选（数组）
		isCollectible = null, // 收藏品筛选（null=全部, true=是, false=否）
		baseWeapon = [], // 基础武器筛选（数组）
	} = options;

	try {
		// 构建 WHERE 条件
		const conditions = [];
		const params = [];

		// 价格筛选
		if (minPrice !== null && minPrice !== "") {
			conditions.push("price >= ?");
			params.push(parseFloat(minPrice));
		}
		if (maxPrice !== null && maxPrice !== "") {
			conditions.push("price <= ?");
			params.push(parseFloat(maxPrice));
		}

		// 外观筛选
		if (appearance && appearance.length > 0) {
			// 需要将常量值转换为数据库中的中文值
			const appearanceMap = {
				factory_new: "崭新出厂",
				minimal_wear: "略有磨损",
				field_tested: "久经沙场",
				well_worn: "破损不堪",
				battle_scarred: "战痕累累",
			};
			const appearanceValues = appearance
				.map((val) => appearanceMap[val] || val)
				.filter(Boolean);
			if (appearanceValues.length > 0) {
				conditions.push(
					`appearance IN (${appearanceValues.map(() => "?").join(",")})`
				);
				params.push(...appearanceValues);
			}
		}

		// 类别筛选
		if (category && category.length > 0) {
			const categoryMap = {
				weapon_skin: "武器皮肤",
				sticker: "印花",
				glove: "手套",
				knife: "刀具",
				music_kit: "音乐盒",
			};
			const categoryValues = category
				.map((val) => categoryMap[val] || val)
				.filter(Boolean);
			if (categoryValues.length > 0) {
				conditions.push(
					`category IN (${categoryValues.map(() => "?").join(",")})`
				);
				params.push(...categoryValues);
			}
		}

		// 品质筛选
		if (quality && quality.length > 0) {
			const qualityMap = {
				consumer: "消费级",
				industrial: "工业级",
				milspec: "军规级",
				restricted: "受限",
				classified: "保密",
				covert: "隐秘",
				exceedingly_rare: "非凡",
			};
			const qualityValues = quality
				.map((val) => qualityMap[val] || val)
				.filter(Boolean);
			if (qualityValues.length > 0) {
				conditions.push(
					`quality IN (${qualityValues.map(() => "?").join(",")})`
				);
				params.push(...qualityValues);
			}
		}

		// 收藏品筛选
		if (isCollectible !== null && isCollectible !== "") {
			conditions.push("isCollectible = ?");
			params.push(
				isCollectible === true ||
					isCollectible === "true" ||
					isCollectible === 1
					? 1
					: 0
			);
		}

		// 基础武器筛选
		if (baseWeapon && baseWeapon.length > 0) {
			conditions.push(`baseWeapon IN (${baseWeapon.map(() => "?").join(",")})`);
			params.push(...baseWeapon);
		}

		// 构建 WHERE 子句
		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

		// 计算偏移量
		const offset = (page - 1) * pageSize;

		// 查询总数
		const [countResult] = await pool.execute(
			`SELECT COUNT(*) as total FROM weapon_skins ${whereClause}`,
			params
		);
		const total = countResult[0].total;

		// 查询数据
		const [rows] = await pool.execute(
			`SELECT * FROM weapon_skins ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
			[...params, pageSize, offset]
		);

		// 计算总页数
		const totalPages = Math.ceil(total / pageSize);

		return {
			success: true,
			data: rows,
			pagination: {
				page: parseInt(page),
				pageSize: parseInt(pageSize),
				total: total,
				totalPages: totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		};
	} catch (error) {
		console.error("❌ 分页查询失败：", error.message);
		throw error;
	}
}

// 更新暴露（添加新功能）
module.exports = {
	getAllWeaponSkins,
	addWeaponSkin, // 新增2
	deleteWeaponSkin, // 新增3
	updateWeaponSkinPrice, // 新增4
	updateWeaponSkinStock, // 新增5
	getWeaponSkinsWithPagination, // 新增6
};
