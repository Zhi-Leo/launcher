// model/weaponSkinModel.js
const { pool } = require("../config/db");

// 👉 第1个功能：查询所有武器
async function getAllWeaponSkins() {
	try {
		const [rows] = await pool.execute(
			"SELECT * FROM weapon_skinskins ORDER BY id DESC"
		);
		return rows;
	} catch (error) {
		console.error("❌ 查询所有数据失败：", error.message);
		throw error;
	}
}

// 👉 第2个功能：新增单条数据
async function addWeaponSkin(weaponSkin) {
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

	try {
		const [result] = await pool.execute(
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
				isCollectible ? 1 : 0,
				imgUrl,
				stock,
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

// 👉 获取单个商品详情
async function getWeaponSkinById(id) {
	if (!id || isNaN(parseInt(id))) throw new Error("ID 必须为有效数字");

	try {
		const [rows] = await pool.execute(
			"SELECT * FROM weapon_skins WHERE id = ?",
			[parseInt(id)]
		);
		if (rows.length === 0) {
			throw new Error(`未找到 ID=${id} 的数据`);
		}
		return rows[0];
	} catch (error) {
		console.error(`❌ 查询 ID=${id} 失败：`, error.message);
		throw error;
	}
}

// 👉 第3个功能：按 ID 删除数据
async function deleteWeaponSkin(id) {
	if (!id || isNaN(parseInt(id))) throw new Error("ID 必须为有效数字");

	try {
		const [result] = await pool.execute(
			"DELETE FROM weapon_skins WHERE id = ?",
			[parseInt(id)]
		);
		if (result.affectedRows === 0) throw new Error(`未找到 ID=${id} 的数据`);
		return { success: true, message: `ID=${id} 数据已删除` };
	} catch (error) {
		console.error(`❌ 删除 ID=${id} 失败：`, error.message);
		throw error;
	}
}

// 👉 第4个功能：按 ID 修改价格
async function updateWeaponSkinPrice(id, newPrice) {
	if (!id || isNaN(parseInt(id))) throw new Error("ID 必须为有效数字");
	if (typeof newPrice !== "number" || newPrice < 0) {
		throw new Error("价格必须为非负数值");
	}

	try {
		const [result] = await pool.execute(
			"UPDATE weapon_skins SET price = ? WHERE id = ?",
			[newPrice, parseInt(id)]
		);
		if (result.affectedRows === 0) throw new Error(`未找到 ID=${id} 的数据`);
		return { success: true, message: `价格更新为 ${newPrice} 元` };
	} catch (error) {
		console.error(`❌ 修改 ID=${id} 价格失败：`, error.message);
		throw error;
	}
}

// 👉 更新库存
async function updateWeaponSkinStock(id, newStock) {
	if (!id || isNaN(parseInt(id))) throw new Error("ID 必须为有效数字");
	if (typeof newStock !== "number" || newStock < 0) {
		throw new Error("库存必须为非负整数");
	}

	try {
		const [result] = await pool.execute(
			"UPDATE weapon_skins SET stock = ? WHERE id = ?",
			[newStock, parseInt(id)]
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

// 👉 完整更新商品信息
async function updateWeaponSkin(id, weaponSkin) {
	if (!id || isNaN(parseInt(id))) throw new Error("ID 必须为有效数字");

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

	try {
		const [result] = await pool.execute(
			`UPDATE weapon_skins 
       SET name = ?, baseWeapon = ?, price = ?, appearance = ?, category = ?, 
           quality = ?, isCollectible = ?, imgUrl = ?, stock = ?
       WHERE id = ?`,
			[
				name,
				baseWeapon,
				price,
				appearance,
				category,
				quality,
				isCollectible ? 1 : 0,
				imgUrl,
				stock,
				parseInt(id),
			]
		);

		if (result.affectedRows === 0) {
			throw new Error(`未找到 ID=${id} 的数据`);
		}

		return {
			success: true,
			message: "更新成功",
			affectedRows: result.affectedRows,
		};
	} catch (error) {
		console.error(`❌ 更新 ID=${id} 失败：`, error.message);
		throw error;
	}
}

// 👉 分页查询武器皮肤（支持筛选）
async function getWeaponSkinsWithPagination(options = {}) {
	const {
		page = 1,
		pageSize = 12,
		minPrice = null,
		maxPrice = null,
		appearance = [],
		category = [],
		quality = [],
		isCollectible = null,
		baseWeapon = [],
	} = options;

	try {
		// 1. 强校验并转换分页参数为【整数】（关键修复）
		const validPage = Number.isInteger(+page) ? +page : 1;
		const validPageSize = Number.isInteger(+pageSize) ? +pageSize : 12;
		if (validPage < 1) throw new Error("页码必须为正整数");
		if (validPageSize < 1 || validPageSize > 100)
			throw new Error("每页数量必须为1-100的整数");
		const offset = (validPage - 1) * validPageSize;

		// 强制转换为【无符号整数】（核心：避免浮点数/字符串传入）
		const limit = Math.abs(Math.floor(validPageSize));
		const skip = Math.abs(Math.floor(offset));

		// 2. 构建 WHERE 条件和参数
		const conditions = [];
		const params = [];

		// 价格筛选：校验是否为有效数字
		if (minPrice !== null && minPrice !== "") {
			const numMinPrice = parseFloat(minPrice);
			if (!isNaN(numMinPrice)) {
				conditions.push("price >= ?");
				params.push(numMinPrice);
			}
		}
		if (maxPrice !== null && maxPrice !== "") {
			const numMaxPrice = parseFloat(maxPrice);
			if (!isNaN(numMaxPrice)) {
				conditions.push("price <= ?");
				params.push(numMaxPrice);
			}
		}

		// 外观筛选：避免生成空的 IN ()
		if (appearance && appearance.length > 0) {
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
			// 只有当转换后有值时，才添加条件
			if (appearanceValues.length > 0) {
				conditions.push(
					`appearance IN (${appearanceValues.map(() => "?").join(",")})`
				);
				params.push(...appearanceValues);
			}
		}

		// 类别筛选：避免空 IN ()
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

		// 品质筛选：避免空 IN ()
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

		// 基础武器筛选：避免空 IN ()
		if (baseWeapon && baseWeapon.length > 0) {
			const baseWeaponValues = baseWeapon.filter(Boolean);
			if (baseWeaponValues.length > 0) {
				conditions.push(
					`baseWeapon IN (${baseWeaponValues.map(() => "?").join(",")})`
				);
				params.push(...baseWeaponValues);
			}
		}

		// 构建 WHERE 子句
		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

		// 3. 查询总数（参数与筛选条件一致）
		const [countResult] = await pool.execute(
			`SELECT COUNT(*) as total FROM weapon_skins ${whereClause}`,
			params
		);
		const total = countResult[0].total;

		// 5. 修复 SQL 执行逻辑（关键变更）
		// 方案1：使用整数参数 + 明确的类型转换（推荐）
		const querySQL = `SELECT * FROM weapon_skins ${whereClause} ORDER BY id DESC LIMIT ?, ?`;
		// 合并参数并强制转换为整数
		const queryParams = [...params, skip, limit].map((param) => {
			if (Number.isInteger(+param)) return +param;
			return param;
		});

		// 验证参数数量和类型
		const placeholderCount = (querySQL.match(/\?/g) || []).length;
		if (placeholderCount !== queryParams.length) {
			throw new Error(
				`参数数量不匹配：SQL需要${placeholderCount}个，实际传递${queryParams.length}个`
			);
		}

		console.log("执行的SQL:", querySQL);
		console.log("传递的参数:", queryParams);
		console.log(
			"参数类型:",
			queryParams.map((p) => typeof p)
		); // 检查参数类型是否为 number

		// 执行查询（使用 pool.query 替代 pool.execute，兼容部分驱动）
		const [rows] = await pool.query(querySQL, queryParams);

		// 6. 计算分页信息（原有逻辑不变）
		const totalPages = Math.ceil(total / validPageSize);

		return {
			success: true,
			data: rows,
			pagination: {
				page: validPage,
				pageSize: validPageSize,
				total: total,
				totalPages: totalPages,
				hasNext: validPage < totalPages,
				hasPrev: validPage > 1,
			},
		};
	} catch (error) {
		console.error("❌ 分页查询失败：", error.message);
		throw error;
	}
}

// 暴露方法
module.exports = {
	getAllWeaponSkins,
	addWeaponSkin,
	deleteWeaponSkin,
	updateWeaponSkinPrice,
	updateWeaponSkinStock,
	getWeaponSkinsWithPagination,
	getWeaponSkinById,
	updateWeaponSkin,
};
