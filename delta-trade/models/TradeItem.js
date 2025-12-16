const pool = require('../config/db');

class TradeItem {
  // 获取所有商品（支持筛选和排序）
  static async getAll(params = {}) {
    const { 
      category = '', 
      quality = '', 
      keyword = '', 
      sort = 'price', 
      order = 'ASC' 
    } = params;

    // 构建查询条件
    let whereClause = '1=1';
    const queryParams = [];

    if (category) {
      whereClause += ' AND category = ?';
      queryParams.push(category);
    }

    if (quality) {
      whereClause += ' AND quality = ?';
      queryParams.push(quality);
    }

    if (keyword) {
      whereClause += ' AND name LIKE ?';
      queryParams.push(`%${keyword}%`);
    }

    // 构建排序
    const validSorts = ['price', 'sell_count', 'created_at'];
    const sortField = validSorts.includes(sort) ? sort : 'price';
    const orderType = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const query = `
      SELECT * FROM trade_items 
      WHERE ${whereClause}
      ORDER BY ${sortField} ${orderType}
    `;

    const [rows] = await pool.execute(query, queryParams);
    return rows;
  }

  // 获取商品分类列表
  static async getCategories() {
    const [rows] = await pool.execute('SELECT DISTINCT category FROM trade_items');
    return rows.map(item => item.category);
  }

  // 获取品质列表
  static async getQualities() {
    const [rows] = await pool.execute('SELECT DISTINCT quality FROM trade_items');
    return rows.map(item => item.quality);
  }
}

module.exports = TradeItem;