// 搜索表单提交优化
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('filter-form');
  const searchInput = searchForm.querySelector('input[name="keyword"]');

  // 按回车搜索
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchForm.submit();
    }
  });

  // 购买按钮点击效果
  const buyBtns = document.querySelectorAll('.buy-btn');
  buyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const itemName = btn.closest('.item-card').querySelector('.item-name').textContent;
      alert(`已成功购买【${itemName}】！`);
    });
  });
});