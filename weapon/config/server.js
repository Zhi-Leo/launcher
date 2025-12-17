// server.js - Web 服务器，提供静态文件服务
const express = require("express");
const path = require("path");
const { getAllFilterOptions } = require("./filterOptions");
const weaponSkinModel = require("../model/weaponSkinModel");

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON 请求体
app.use(express.json());

// 提供静态文件服务（CSS、JS、图片等）
app.use(express.static(path.join(__dirname, "../public")));

// 主页路由
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// API: 获取所有筛选选项
app.get("/api/filter-options", (req, res) => {
	try {
		const options = getAllFilterOptions();
		res.json({
			success: true,
			data: options,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "获取筛选选项失败",
			error: error.message,
		});
	}
});

// API: 分页查询武器皮肤
app.get("/api/weapon-skins", async (req, res) => {
	try {
		const {
			page = 1,
			pageSize = 12,
			minPrice,
			maxPrice,
			appearance,
			category,
			quality,
			isCollectible,
			baseWeapon,
		} = req.query;

		// 处理数组参数
		const parseArrayParam = (param) => {
			if (!param) return [];
			if (Array.isArray(param)) return param;
			if (typeof param === "string") {
				try {
					const parsed = JSON.parse(param);
					return Array.isArray(parsed) ? parsed : [parsed];
				} catch {
					return param.split(",").filter(Boolean);
				}
			}
			return [];
		};

		const options = {
			page: parseInt(page),
			pageSize: parseInt(pageSize),
			minPrice: minPrice || null,
			maxPrice: maxPrice || null,
			appearance: parseArrayParam(appearance),
			category: parseArrayParam(category),
			quality: parseArrayParam(quality),
			isCollectible:
				isCollectible !== undefined
					? isCollectible === "true" || isCollectible === "1"
					: null,
			baseWeapon: parseArrayParam(baseWeapon),
		};

		const result = await weaponSkinModel.getWeaponSkinsWithPagination(options);
		res.json(result);
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "查询武器皮肤失败",
			error: error.message,
		});
	}
});

// API: 获取单个商品详情
app.get("/api/weapon-skins/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		if (isNaN(id)) {
			return res.status(400).json({
				success: false,
				message: "无效的ID",
			});
		}

		const item = await weaponSkinModel.getWeaponSkinById(id);
		res.json({
			success: true,
			data: item,
		});
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
});

// API: 新增商品
app.post("/api/weapon-skins", async (req, res) => {
	try {
		const result = await weaponSkinModel.addWeaponSkin(req.body);
		res.status(201).json(result);
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message,
		});
	}
});

// API: 更新商品（完整更新）
app.put("/api/weapon-skins/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		if (isNaN(id)) {
			return res.status(400).json({
				success: false,
				message: "无效的ID",
			});
		}

		const result = await weaponSkinModel.updateWeaponSkin(id, req.body);
		res.json(result);
	} catch (error) {
		res.status(400).json({
			success: false,
			message: error.message,
		});
	}
});

// API: 删除商品
app.delete("/api/weapon-skins/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		if (isNaN(id)) {
			return res.status(400).json({
				success: false,
				message: "无效的ID",
			});
		}

		const result = await weaponSkinModel.deleteWeaponSkin(id);
		res.json(result);
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
});

// 启动服务器
app.listen(PORT, () => {
	console.log(`服务器运行在 http://localhost:${PORT}`);
	console.log("请在浏览器中打开上述地址查看页面");
});
