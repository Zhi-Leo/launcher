// model/weaponSkinModel.js
const { pool } = require('../config/db');

// 👉 第1个功能：查询所有武器
async function getAllWeaponSkins() {
  try {
    const [rows] = await pool.execute('SELECT * FROM weapon_skins ORDER BY id DESC');
    return rows;
  } catch (error) {
    console.error('❌ 查询所有数据失败：', error.message);
    throw error;
  }
}

// model/weaponSkinModel.js（新增）
// 👉 第2个功能：新增单条数据
async function addWeaponSkin(weaponSkin) {
  const { name, baseWeapon, skinName, price, appearance, category, stock } = weaponSkin;
  try {
    const [result] = await pool.execute(
      `INSERT INTO weapon_skins 
       (name, baseWeapon, skinName, price, appearance, category, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, baseWeapon, skinName || '', price, appearance || '未知', category || '武器皮肤', stock || 0]
    );
    return {
      success: true,
      insertId: result.insertId,
      message: '新增成功'
    };
  } catch (error) {
    console.error('❌ 新增数据失败：', error.message);
    throw error;
  }
}

// model/weaponSkinModel.js（新增）
// 👉 第3个功能：按 ID 删除数据
async function deleteWeaponSkin(id) {
  if (!id) throw new Error('ID 不能为空');

  try {
    const [result] = await pool.execute(
      'DELETE FROM weapon_skins WHERE id = ?',
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
  if (!id) throw new Error('ID 不能为空');
  if (typeof newPrice !== 'number' || newPrice < 0) {
    throw new Error('价格必须为非负数值');
  }

  try {
    const [result] = await pool.execute(
      'UPDATE weapon_skins SET price = ? WHERE id = ?',
      [newPrice, id]
    );
    if (result.affectedRows === 0) throw new Error(`未找到 ID=${id} 的数据`);
    return { success: true, message: `价格更新为 ${newPrice} 元` };
  } catch (error) {
    console.error(`❌ 修改 ID=${id} 价格失败：`, error.message);
    throw error;
  }
}

// 更新暴露（添加新功能）
module.exports = {
  getAllWeaponSkins,
  addWeaponSkin, // 新增2
  deleteWeaponSkin, // 新增3
  updateWeaponSkinPrice // 新增4
};