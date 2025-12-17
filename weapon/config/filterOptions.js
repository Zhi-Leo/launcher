// config/filterOptions.js - 筛选选项配置
function getAllFilterOptions() {
	return {
		appearance: [
			{ value: "factory_new", label: "崭新出厂" },
			{ value: "minimal_wear", label: "略有磨损" },
			{ value: "field_tested", label: "久经沙场" },
			{ value: "well_worn", label: "破损不堪" },
			{ value: "battle_scarred", label: "战痕累累" },
		],
		category: [
			{ value: "weapon_skin", label: "武器皮肤" },
			{ value: "sticker", label: "印花" },
			{ value: "glove", label: "手套" },
			{ value: "knife", label: "刀具" },
			{ value: "music_kit", label: "音乐盒" },
		],
		quality: [
			{ value: "consumer", label: "消费级" },
			{ value: "industrial", label: "工业级" },
			{ value: "milspec", label: "军规级" },
			{ value: "restricted", label: "受限" },
			{ value: "classified", label: "保密" },
			{ value: "covert", label: "隐秘" },
			{ value: "exceedingly_rare", label: "非凡" },
		],
		collectibles: [
			{ value: "true", label: "是" },
			{ value: "false", label: "否" },
		],
	};
}

module.exports = { getAllFilterOptions };
