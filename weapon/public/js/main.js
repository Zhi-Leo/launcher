// 存储筛选选项数据
let filterOptionsData = {};

// 从后端获取筛选选项
async function loadFilterOptions() {
    try {
        const response = await fetch('/api/filter-options');
        const result = await response.json();
        
        if (result.success) {
            filterOptionsData = result.data;
            renderFilterOptions();
        } else {
            console.error('获取筛选选项失败:', result.message);
        }
    } catch (error) {
        console.error('加载筛选选项时出错:', error);
    }
}

// 渲染筛选选项到页面
function renderFilterOptions() {
    // 渲染外观选项
    renderOptions('appearance-options', filterOptionsData.appearance || [], 'appearance');
    
    // 渲染类别选项
    renderOptions('category-options', filterOptionsData.category || [], 'category');
    
    // 渲染品质选项
    renderOptions('quality-options', filterOptionsData.quality || [], 'quality');
    
    // 渲染收藏品选项
    renderOptions('collectibles-options', filterOptionsData.collectibles || [], 'collectibles');
}

// 渲染单个筛选类型的选项
function renderOptions(containerId, options, filterType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${filterType}-${option.value}`;
        checkbox.value = option.value;
        checkbox.dataset.filterType = filterType;
        
        const label = document.createElement('label');
        label.htmlFor = `${filterType}-${option.value}`;
        label.textContent = option.label;
        
        optionElement.appendChild(checkbox);
        optionElement.appendChild(label);
        container.appendChild(optionElement);
    });
}

// 获取当前选中的筛选值
function getSelectedFilters(filterType) {
    const checkboxes = document.querySelectorAll(`input[data-filter-type="${filterType}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// 标签页切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 首先加载筛选选项
    loadFilterOptions();
    
    // 初始化左右两侧的广告轮播
    setTimeout(() => {
        initAdCarousel('.sidebar-left');
        initAdCarousel('.sidebar-right');
    }, 100);
    
    const tabs = document.querySelectorAll('.tab');
    const filterSections = document.querySelectorAll('.filter-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // 移除所有活动状态
            tabs.forEach(t => t.classList.remove('active'));
            filterSections.forEach(section => section.classList.add('hidden'));
            
            // 添加当前活动状态
            this.classList.add('active');
            const targetSection = document.getElementById(`${tabName}-filter`);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        });
    });

    // 价格过滤按钮功能
    const priceFilterBtn = document.getElementById('filter-btn');
    if (priceFilterBtn) {
        priceFilterBtn.addEventListener('click', function() {
            const minPrice = document.getElementById('min-price').value;
            const maxPrice = document.getElementById('max-price').value;
            
            const filters = {
                price: {
                    min: minPrice ? parseFloat(minPrice) : null,
                    max: maxPrice ? parseFloat(maxPrice) : null
                }
            };
            
            console.log('价格筛选:', filters);
            applyFilters(filters);
        });
    }
    
    // 其他筛选类型的应用按钮
    document.querySelectorAll('.filter-btn[data-filter-type]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter-type');
            const selectedValues = getSelectedFilters(filterType);
            
            const filters = {
                [filterType]: selectedValues
            };
            
            console.log(`${filterType}筛选:`, filters);
            applyFilters(filters);
        });
    });
});

// 应用筛选（可以在这里调用API或过滤商品列表）
function applyFilters(filters) {
    console.log('应用筛选条件:', filters);
    // TODO: 在这里实现实际的筛选逻辑
    // 例如：调用后端API获取筛选后的商品列表
}

// 广告轮播功能
function initAdCarousel(sidebarSelector) {
    const sidebar = document.querySelector(sidebarSelector);
    if (!sidebar) return;
    
    const adItems = sidebar.querySelectorAll('.ad-item');
    const indicators = sidebar.querySelectorAll('.indicator');
    let currentIndex = 0;
    let carouselInterval;
    
    // 切换到指定索引的广告
    function switchAd(index) {
        // 移除所有活动状态
        adItems.forEach(item => item.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // 添加新的活动状态
        if (adItems[index]) {
            adItems[index].classList.add('active');
        }
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
        
        currentIndex = index;
    }
    
    // 切换到下一张广告
    function nextAd() {
        const nextIndex = (currentIndex + 1) % adItems.length;
        switchAd(nextIndex);
    }
    
    // 启动自动轮播
    function startCarousel() {
        carouselInterval = setInterval(nextAd, 5000); // 每5秒切换一次
    }
    
    // 停止自动轮播
    function stopCarousel() {
        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
    }
    
    // 为指示器添加点击事件
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            switchAd(index);
            stopCarousel();
            startCarousel(); // 重新开始计时
        });
    });
    
    // 鼠标悬停时暂停轮播
    sidebar.addEventListener('mouseenter', stopCarousel);
    sidebar.addEventListener('mouseleave', startCarousel);
    
    // 启动自动轮播
    startCarousel();
}


