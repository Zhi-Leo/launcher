// index.js
const { testPoolConnection } = require('./config/db');
const weaponSkinModel = require('./model/weaponSkinModel');

// 👉 测试 1：查询所有数据（对应 getAllWeaponSkins 功能）
async function testGetAllWeaponSkins() {
  console.log('===== 开始测试：查询所有数据 =====');
  try {
    // 先测试连接池
    await testPoolConnection();
    // 调用查询函数
    const result = await weaponSkinModel.getAllWeaponSkins();
    console.log('查询成功！结果：');
    console.log(result.length > 0 ? result : '暂无数据');
  } catch (error) {
    console.log('查询失败！原因：', error.message);
  }
  console.log('===== 测试结束：查询所有数据 =====\n');
}

// index.js（新增测试函数）
// 👉 测试 2：新增单条数据（对应 addWeaponSkin 功能）
async function testAddWeaponSkin() {
  console.log('===== 开始测试：新增单条数据 =====');
  // 测试用数据
  const testData = {
    name: 'AK-47 | 火神 (崭新出厂)',
    baseWeapon: 'AK-47',
    skinName: '火神',
    price: 1599.99,
    appearance: '崭新出厂',
    category: '武器皮肤',
    stock: 8
  };
  try {
    await testPoolConnection();
    const result = await weaponSkinModel.addWeaponSkin(testData);
    console.log('新增成功！结果：', result);
    // 额外验证：查询刚新增的数据
    const newData = await weaponSkinModel.getWeaponSkinById(result.insertId);
    console.log('验证新增数据：', newData);
  } catch (error) {
    console.log('新增失败！原因：', error.message);
  }
  console.log('===== 测试结束：新增单条数据 =====\n');
}

// index.js（新增测试函数）
// 👉 测试 3：删除数据（对应 deleteWeaponSkin 功能）
async function testDeleteWeaponSkin() {
  console.log('===== 开始测试：删除数据 =====');
  try {
    await testPoolConnection();
    // 执行删除：这里的id需要跟数据库保持一致
    const result = await weaponSkinModel.deleteWeaponSkin(2);
    console.log('删除结果：', result);
  } catch (error) {
    console.log('删除失败！原因：', error.message);
  }
  console.log('===== 测试结束：删除数据 =====\n');
}

// 👉 测试 4：修改价格（对应 updateWeaponSkinPrice 功能）
async function testUpdateWeaponSkinPrice() {
  console.log('===== 开始测试：修改价格 =====');
  const testId = 3; // 实际存在的 ID
  const newPrice = 1799.99;
  try {
    await testPoolConnection();
    const result = await weaponSkinModel.updateWeaponSkinPrice(testId, newPrice);
    console.log('修改结果：', result);
  } catch (error) {
    console.log('修改失败！原因：', error.message);
  }
  console.log('===== 测试结束：修改价格 =====\n');
}

// 👉 执行当前测试（只运行这一个）
// testGetAllWeaponSkins(); //查询
// testAddWeaponSkin(); //新增
// testDeleteWeaponSkin(); //删除
testUpdateWeaponSkinPrice(); //修改价格