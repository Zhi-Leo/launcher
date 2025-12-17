// 存储筛选选项数据
let filterOptionsData = {};

// 从后端获取筛选选项
async function loadFilterOptions() {
	try {
		const response = await fetch("/api/filter-options");
		const result = await response.json();

		if (result.success) {
			filterOptionsData = result.data;
			renderFilterOptions();
		} else {
			console.error("获取筛选选项失败:", result.message);
		}
	} catch (error) {
		console.error("加载筛选选项时出错:", error);
	}
}

// 渲染筛选选项到页面
function renderFilterOptions() {
	// 渲染外观选项
	renderOptions(
		"appearance-options",
		filterOptionsData.appearance || [],
		"appearance"
	);

	// 渲染类别选项
	renderOptions(
		"category-options",
		filterOptionsData.category || [],
		"category"
	);

	// 渲染品质选项
	renderOptions("quality-options", filterOptionsData.quality || [], "quality");

	// 渲染收藏品选项
	renderOptions(
		"collectibles-options",
		filterOptionsData.collectibles || [],
		"collectibles"
	);
}

// 渲染单个筛选类型的选项
function renderOptions(containerId, options, filterType) {
	const container = document.getElementById(containerId);
	if (!container) return;

	container.innerHTML = "";

	options.forEach((option) => {
		const optionElement = document.createElement("div");
		optionElement.className = "filter-option";

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = `${filterType}-${option.value}`;
		checkbox.value = option.value;
		checkbox.dataset.filterType = filterType;

		const label = document.createElement("label");
		label.htmlFor = `${filterType}-${option.value}`;
		label.textContent = option.label;

		optionElement.appendChild(checkbox);
		optionElement.appendChild(label);
		container.appendChild(optionElement);
	});
}

// 获取当前选中的筛选值
function getSelectedFilters(filterType) {
	const checkboxes = document.querySelectorAll(
		`input[data-filter-type="${filterType}"]:checked`
	);
	return Array.from(checkboxes).map((cb) => cb.value);
}

// 标签页切换功能
document.addEventListener("DOMContentLoaded", function () {
	// 首先加载筛选选项
	loadFilterOptions();

	// 加载商品列表
	loadItems();

	// 关闭按钮功能（可选，可以隐藏或关闭某些元素）
	const closeBtn = document.getElementById("close-btn");
	if (closeBtn) {
		closeBtn.addEventListener("click", function () {
			// 可以在这里添加关闭逻辑，比如关闭某个弹窗或返回上一页
			console.log("关闭按钮被点击");
			// 示例：可以隐藏标题栏
			// document.querySelector('.page-title').style.display = 'none';
		});
	}

	// 初始化左右两侧的广告轮播
	setTimeout(() => {
		initAdCarousel(".sidebar-left");
		initAdCarousel(".sidebar-right");
	}, 100);

	const tabs = document.querySelectorAll(".tab");
	const filterSections = document.querySelectorAll(".filter-section");

	tabs.forEach((tab) => {
		tab.addEventListener("click", function () {
			const tabName = this.getAttribute("data-tab");

			// 移除所有活动状态
			tabs.forEach((t) => t.classList.remove("active"));
			filterSections.forEach((section) => section.classList.add("hidden"));

			// 添加当前活动状态
			this.classList.add("active");
			const targetSection = document.getElementById(`${tabName}-filter`);
			if (targetSection) {
				targetSection.classList.remove("hidden");
			}
		});
	});

	// 价格过滤按钮功能
	const priceFilterBtn = document.getElementById("filter-btn");
	if (priceFilterBtn) {
		priceFilterBtn.addEventListener("click", function () {
			const minPrice = document.getElementById("min-price").value;
			const maxPrice = document.getElementById("max-price").value;

			const filters = {
				price: {
					min: minPrice ? parseFloat(minPrice) : null,
					max: maxPrice ? parseFloat(maxPrice) : null,
				},
			};

			console.log("价格筛选:", filters);
			applyFilters(filters);
		});
	}

	// 其他筛选类型的应用按钮（使用事件委托，因为按钮是动态生成的）
	document.addEventListener("click", function (e) {
		if (
			e.target &&
			e.target.classList.contains("filter-btn") &&
			e.target.dataset.filterType
		) {
			const filterType = e.target.dataset.filterType;
			const selectedValues = getSelectedFilters(filterType);

			const filters = {
				[filterType]: selectedValues,
			};

			console.log(`${filterType}筛选:`, filters);
			applyFilters(filters);
		}
	});

	// 上一页/下一页按钮
	const prevBtn = document.getElementById("prev-btn");
	const nextBtn = document.getElementById("next-btn");

	if (prevBtn) {
		prevBtn.addEventListener("click", () => {
			if (currentPage > 1) {
				currentPage--;
				loadItems();
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		});
	}

	if (nextBtn) {
		nextBtn.addEventListener("click", () => {
			currentPage++;
			loadItems();
			window.scrollTo({ top: 0, behavior: "smooth" });
		});
	}
});

// 全局状态管理
let currentPage = 1;
let currentFilters = {};
const pageSize = 12;

// 应用筛选（调用API获取筛选后的商品列表）
function applyFilters(filters) {
	console.log("应用筛选条件:", filters);
	// 合并筛选条件
	currentFilters = { ...currentFilters, ...filters };
	currentPage = 1; // 重置到第一页
	loadItems();
}

// 加载商品列表
async function loadItems() {
	const itemsGrid = document.getElementById("items-grid");
	const paginationContainer = document.getElementById("pagination-container");

	// 显示加载状态
	itemsGrid.innerHTML = '<div class="loading">加载中</div>';

	try {
		// 构建查询参数
		const params = new URLSearchParams({
			page: currentPage,
			pageSize: pageSize,
		});

		// 添加价格筛选
		if (currentFilters.price) {
			if (currentFilters.price.min) {
				params.append("minPrice", currentFilters.price.min);
			}
			if (currentFilters.price.max) {
				params.append("maxPrice", currentFilters.price.max);
			}
		}

		// 添加其他筛选
		if (currentFilters.appearance && currentFilters.appearance.length > 0) {
			currentFilters.appearance.forEach((val) => {
				params.append("appearance", val);
			});
		}

		if (currentFilters.category && currentFilters.category.length > 0) {
			currentFilters.category.forEach((val) => {
				params.append("category", val);
			});
		}

		if (currentFilters.quality && currentFilters.quality.length > 0) {
			currentFilters.quality.forEach((val) => {
				params.append("quality", val);
			});
		}

		if (currentFilters.collectibles && currentFilters.collectibles.length > 0) {
			const collectibleValue = currentFilters.collectibles[0];
			if (collectibleValue === "true") {
				params.append("isCollectible", "true");
			} else if (collectibleValue === "false") {
				params.append("isCollectible", "false");
			}
		}

		// 调用API
		const response = await fetch(`/api/weapon-skins?${params.toString()}`);
		const result = await response.json();

		if (result.success) {
			renderItems(result.data);
			renderPagination(result.pagination);
		} else {
			itemsGrid.innerHTML =
				'<div class="empty-state">加载失败，请稍后重试</div>';
			console.error("加载商品失败:", result.message);
		}
	} catch (error) {
		itemsGrid.innerHTML = '<div class="empty-state">网络错误，请检查连接</div>';
		console.error("加载商品时出错:", error);
	}
}

// 渲染商品列表
function renderItems(items) {
	const itemsGrid = document.getElementById("items-grid");

	if (!items || items.length === 0) {
		itemsGrid.innerHTML = '<div class="empty-state">暂无商品</div>';
		return;
	}

	itemsGrid.innerHTML = items
		.map(
			(item) => `
        <div class="item-card" data-id="${item.id}">
            <div class="item-image">
                ${
									item.imgUrl
										? `<img src="${item.imgUrl}" alt="${item.name}" onerror="this.parentElement.innerHTML='暂无图片'">`
										: "暂无图片"
								}
            </div>
            <div class="item-info">
                <div class="item-name">${escapeHtml(
									item.name || "未知商品"
								)}</div>
                <div class="item-details">
                    <div class="item-detail-item">
                        <span>基础武器:</span>
                        <span>${escapeHtml(item.baseWeapon || "未知")}</span>
                    </div>
                    ${
											item.appearance
												? `
                        <div class="item-detail-item">
                            <span>外观:</span>
                            <span>${escapeHtml(item.appearance)}</span>
                        </div>
                    `
												: ""
										}
                    ${
											item.category
												? `
                        <div class="item-detail-item">
                            <span>类别:</span>
                            <span>${escapeHtml(item.category)}</span>
                        </div>
                    `
												: ""
										}
                    ${
											item.quality
												? `
                        <div class="item-detail-item">
                            <span>品质:</span>
                            <span>${escapeHtml(item.quality)}</span>
                        </div>
                    `
												: ""
										}
                    ${
											item.isCollectible
												? `
                        <div class="item-detail-item">
                            <span>收藏品:</span>
                            <span>是</span>
                        </div>
                    `
												: ""
										}
                </div>
                <div class="item-price">${formatPrice(item.price || 0)}</div>
                <div class="item-stock ${item.stock > 0 ? "in-stock" : "low"}">
                    库存: ${item.stock || 0}
                </div>
                <div class="item-actions">
                    <button class="item-action-btn edit" onclick="openEditModal(${
											item.id
										})">编辑</button>
                    <button class="item-action-btn delete" onclick="openDeleteModal(${
											item.id
										}, '${escapeHtml(item.name || "未知商品")}')">删除</button>
                </div>
            </div>
        </div>
    `
		)
		.join("");
}

// 渲染分页控件
function renderPagination(pagination) {
	const paginationInfo = document.getElementById("pagination-info");
	const prevBtn = document.getElementById("prev-btn");
	const nextBtn = document.getElementById("next-btn");
	const pageNumbers = document.getElementById("page-numbers");

	if (!pagination) return;

	// 更新分页信息
	paginationInfo.textContent = `共 ${pagination.total} 条，第 ${pagination.page} 页`;

	// 更新上一页/下一页按钮状态
	prevBtn.disabled = !pagination.hasPrev;
	nextBtn.disabled = !pagination.hasNext;

	// 渲染页码
	pageNumbers.innerHTML = "";
	const totalPages = pagination.totalPages;
	const currentPageNum = pagination.page;

	// 计算显示的页码范围
	let startPage = Math.max(1, currentPageNum - 2);
	let endPage = Math.min(totalPages, currentPageNum + 2);

	// 如果总页数较少，显示所有页码
	if (totalPages <= 7) {
		startPage = 1;
		endPage = totalPages;
	} else {
		// 确保显示7个页码
		if (currentPageNum <= 3) {
			startPage = 1;
			endPage = 7;
		} else if (currentPageNum >= totalPages - 2) {
			startPage = totalPages - 6;
			endPage = totalPages;
		}
	}

	// 添加第一页和省略号
	if (startPage > 1) {
		const firstPage = createPageNumber(1);
		pageNumbers.appendChild(firstPage);
		if (startPage > 2) {
			const ellipsis = document.createElement("span");
			ellipsis.textContent = "...";
			ellipsis.style.padding = "0 8px";
			ellipsis.style.color = "rgba(255, 255, 255, 0.5)";
			pageNumbers.appendChild(ellipsis);
		}
	}

	// 添加页码按钮
	for (let i = startPage; i <= endPage; i++) {
		const pageBtn = createPageNumber(i);
		if (i === currentPageNum) {
			pageBtn.classList.add("active");
		}
		pageNumbers.appendChild(pageBtn);
	}

	// 添加最后一页和省略号
	if (endPage < totalPages) {
		if (endPage < totalPages - 1) {
			const ellipsis = document.createElement("span");
			ellipsis.textContent = "...";
			ellipsis.style.padding = "0 8px";
			ellipsis.style.color = "rgba(255, 255, 255, 0.5)";
			pageNumbers.appendChild(ellipsis);
		}
		const lastPage = createPageNumber(totalPages);
		pageNumbers.appendChild(lastPage);
	}
}

// 创建页码按钮
function createPageNumber(pageNum) {
	const pageBtn = document.createElement("button");
	pageBtn.className = "page-number";
	pageBtn.textContent = pageNum;
	pageBtn.addEventListener("click", () => {
		currentPage = pageNum;
		loadItems();
		// 滚动到顶部
		window.scrollTo({ top: 0, behavior: "smooth" });
	});
	return pageBtn;
}

// 工具函数：转义HTML
function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

// 工具函数：格式化价格
function formatPrice(price) {
	return parseFloat(price).toFixed(2);
}

// ==================== 增删改查功能 ====================

// 打开新增弹窗
function openAddModal() {
	const modal = document.getElementById("item-modal");
	const form = document.getElementById("item-form");
	const title = document.getElementById("modal-title");

	title.textContent = "新增商品";
	form.reset();
	document.getElementById("item-id").value = "";
	modal.classList.add("show");
}

// 打开编辑弹窗
async function openEditModal(id) {
	const modal = document.getElementById("item-modal");
	const form = document.getElementById("item-form");
	const title = document.getElementById("modal-title");

	try {
		// 获取商品详情
		const response = await fetch(`/api/weapon-skins/${id}`);
		const result = await response.json();

		if (result.success) {
			const item = result.data;

			// 填充表单
			document.getElementById("item-id").value = item.id;
			document.getElementById("item-name").value = item.name || "";
			document.getElementById("item-baseWeapon").value = item.baseWeapon || "";
			document.getElementById("item-price").value = item.price || 0;
			document.getElementById("item-stock").value = item.stock || 0;
			document.getElementById("item-appearance").value = item.appearance || "";
			document.getElementById("item-category").value = item.category || "";
			document.getElementById("item-quality").value = item.quality || "";
			document.getElementById("item-isCollectible").value = item.isCollectible
				? "1"
				: "0";
			document.getElementById("item-imgUrl").value = item.imgUrl || "";

			title.textContent = "编辑商品";
			modal.classList.add("show");
		} else {
			alert("获取商品信息失败：" + result.message);
		}
	} catch (error) {
		console.error("获取商品信息时出错:", error);
		alert("获取商品信息失败，请稍后重试");
	}
}

// 打开删除确认弹窗
function openDeleteModal(id, name) {
	const modal = document.getElementById("delete-modal");
	const nameElement = document.getElementById("delete-item-name");

	nameElement.textContent = name;
	modal.dataset.itemId = id;
	modal.classList.add("show");
}

// 关闭弹窗
function closeModal(modalId) {
	const modal = document.getElementById(modalId);
	modal.classList.remove("show");
}

// 表单提交（新增/更新）
async function handleFormSubmit(e) {
	e.preventDefault();

	const form = e.target;
	const formData = new FormData(form);
	const id = formData.get("id");
	const data = {
		name: formData.get("name"),
		baseWeapon: formData.get("baseWeapon"),
		price: parseFloat(formData.get("price")),
		appearance: formData.get("appearance"),
		category: formData.get("category"),
		quality: formData.get("quality") || null,
		isCollectible: parseInt(formData.get("isCollectible")) || 0,
		imgUrl: formData.get("imgUrl") || null,
		stock: parseInt(formData.get("stock")),
	};

	try {
		let response;
		if (id) {
			// 更新
			response = await fetch(`/api/weapon-skins/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
		} else {
			// 新增
			response = await fetch("/api/weapon-skins", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
		}

		const result = await response.json();

		if (result.success) {
			alert(id ? "更新成功！" : "新增成功！");
			closeModal("item-modal");
			loadItems(); // 重新加载列表
		} else {
			alert("操作失败：" + result.message);
		}
	} catch (error) {
		console.error("提交表单时出错:", error);
		alert("操作失败，请稍后重试");
	}
}

// 确认删除
async function confirmDelete() {
	const modal = document.getElementById("delete-modal");
	const id = modal.dataset.itemId;

	if (!id) {
		alert("无效的商品ID");
		return;
	}

	try {
		const response = await fetch(`/api/weapon-skins/${id}`, {
			method: "DELETE",
		});

		const result = await response.json();

		if (result.success) {
			alert("删除成功！");
			closeModal("delete-modal");
			loadItems(); // 重新加载列表
		} else {
			alert("删除失败：" + result.message);
		}
	} catch (error) {
		console.error("删除商品时出错:", error);
		alert("删除失败，请稍后重试");
	}
}

// 初始化增删改查功能
document.addEventListener("DOMContentLoaded", function () {
	// 新增按钮
	const addBtn = document.getElementById("add-item-btn");
	if (addBtn) {
		addBtn.addEventListener("click", openAddModal);
	}

	// 表单提交
	const itemForm = document.getElementById("item-form");
	if (itemForm) {
		itemForm.addEventListener("submit", handleFormSubmit);
	}

	// 关闭弹窗按钮
	const modalClose = document.getElementById("modal-close");
	const deleteModalClose = document.getElementById("delete-modal-close");
	const formCancel = document.getElementById("form-cancel");
	const deleteCancel = document.getElementById("delete-cancel");

	if (modalClose) {
		modalClose.addEventListener("click", () => closeModal("item-modal"));
	}
	if (deleteModalClose) {
		deleteModalClose.addEventListener("click", () =>
			closeModal("delete-modal")
		);
	}
	if (formCancel) {
		formCancel.addEventListener("click", () => closeModal("item-modal"));
	}
	if (deleteCancel) {
		deleteCancel.addEventListener("click", () => closeModal("delete-modal"));
	}

	// 确认删除按钮
	const deleteConfirm = document.getElementById("delete-confirm");
	if (deleteConfirm) {
		deleteConfirm.addEventListener("click", confirmDelete);
	}

	// 点击弹窗背景关闭
	const modals = document.querySelectorAll(".modal");
	modals.forEach((modal) => {
		modal.addEventListener("click", function (e) {
			if (e.target === this) {
				this.classList.remove("show");
			}
		});
	});
});

// 广告轮播功能
function initAdCarousel(sidebarSelector) {
	const sidebar = document.querySelector(sidebarSelector);
	if (!sidebar) return;

	const adItems = sidebar.querySelectorAll(".ad-item");
	const indicators = sidebar.querySelectorAll(".indicator");
	let currentIndex = 0;
	let carouselInterval;

	// 切换到指定索引的广告
	function switchAd(index) {
		// 移除所有活动状态
		adItems.forEach((item) => item.classList.remove("active"));
		indicators.forEach((indicator) => indicator.classList.remove("active"));

		// 添加新的活动状态
		if (adItems[index]) {
			adItems[index].classList.add("active");
		}
		if (indicators[index]) {
			indicators[index].classList.add("active");
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
		indicator.addEventListener("click", () => {
			switchAd(index);
			stopCarousel();
			startCarousel(); // 重新开始计时
		});
	});

	// 鼠标悬停时暂停轮播
	sidebar.addEventListener("mouseenter", stopCarousel);
	sidebar.addEventListener("mouseleave", startCarousel);

	// 启动自动轮播
	startCarousel();
}
