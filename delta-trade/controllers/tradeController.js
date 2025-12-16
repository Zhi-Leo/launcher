const TradeItem = require('../models/TradeItem');

// 交易行主页
exports.getTradePage = async (req, res) => {
  try {
    // 获取查询参数
    const queryParams = req.query;
    
    // 获取商品数据
    const items = await TradeItem.getAll(queryParams);
    
    // 获取分类和品质列表（用于筛选）
    const categories = await TradeItem.getCategories();
    const qualities = await TradeItem.getQualities();

    res.render('index', {
      items,
      categories,
      qualities,
      currentParams: queryParams
    });
  } catch (err) {
    console.error('获取交易行数据失败:', err);
    res.status(500).send('服务器错误');
  }
};