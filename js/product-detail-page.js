// 产品明细页面脚本 - 轮播图功能

// 样品详细数据（包含多角度图片）
// 注意：图片目前使用占位符，您后续可以替换为实际图片URL
const sampleData = {
    laser: {
        1: { name: '全息镭射卡 - 星空', desc: '星空效果全息镭射，璀璨夺目。适用于高端礼品卡、会员卡、收藏卡。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        2: { name: '全息镭射卡 - 彩虹', desc: '彩虹渐变镭射效果，色彩绚丽。适用于促销卡、礼品卡。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        3: { name: '局部镭射卡 - 文字', desc: '局部文字镭射，精致典雅。突出Logo或品牌文字。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        4: { name: '局部镭射卡 - 图案', desc: '局部图案镭射，突出重点设计元素。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        5: { name: '纹理镭射卡 - 网格', desc: '网格纹理镭射，科技感十足。适用于现代风格设计。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        6: { name: '纹理镭射卡 - 波浪', desc: '波浪纹理镭射，动感时尚。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        7: { name: '烫金+镭射复合卡', desc: '烫金与镭射工艺结合，奢华质感。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        8: { name: 'UV+镭射复合卡', desc: 'UV光油加镭射效果，光泽度更高。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        9: { name: '定制图案镭射卡', desc: '根据客户图案定制镭射效果，独一无二。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] }
    },
    flashcards: {
        1: { name: '字母认知闪卡', desc: '26个字母，彩色印刷。适合2-6岁儿童英语启蒙。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        2: { name: '数字学习卡', desc: '1-100数字，中英文对照。培养数学基础。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        3: { name: '动物认知卡', desc: '常见动物图案+名称，激发孩子好奇心。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        4: { name: '水果蔬菜卡', desc: '健康饮食启蒙，认识日常食物。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        5: { name: '颜色形状卡', desc: '基础颜色与形状认知。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        6: { name: '日常用语卡', desc: '生活常用词汇，提升表达能力。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        7: { name: '英语单词卡', desc: '小学英语词汇，助力学业。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        8: { name: '数学运算卡', desc: '加减乘除练习，提升计算能力。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        9: { name: '记忆训练卡', desc: '配对游戏卡片，锻炼记忆力。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] }
    },
    playingcards: {
        1: { name: '标准扑克牌', desc: '54张标准尺寸，光面处理。适用于家庭娱乐。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        2: { name: '桥牌尺寸扑克', desc: '窄版设计，便于手握。适合桥牌玩家。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        3: { name: '广告扑克牌', desc: '企业Logo定制，品牌推广利器。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        4: { name: '文创扑克牌', desc: '艺术插画风格，收藏价值高。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        5: { name: '黑芯纸扑克', desc: '防透视，赌场级品质。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        6: { name: '塑料扑克牌', desc: '防水耐用，可水洗。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        7: { name: '磨砂面扑克', desc: '哑光质感，防反光。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        8: { name: '金边扑克牌', desc: '金色边缘，奢华版。适合高端礼品。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        9: { name: '收藏版扑克', desc: '限量编号，礼盒包装。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] }
    },
    boardgames: {
        1: { name: 'UNO风格卡牌', desc: '经典桌游卡牌尺寸，适合多人游戏。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        2: { name: '策略游戏卡牌', desc: 'TCG/CCG卡牌标准，适合竞技对战。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        3: { name: '亲子互动卡', desc: '家庭游戏，安全材质。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        4: { name: '角色扮演卡', desc: 'RPG游戏角色卡，精美插画。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        5: { name: '问答游戏卡', desc: '知识竞赛卡片，寓教于乐。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        6: { name: '动作游戏卡', desc: '肢体互动游戏，活跃气氛。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        7: { name: '记忆配对卡', desc: '翻牌配对游戏，锻炼记忆力。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        8: { name: '桌游配件卡', desc: '游戏币、道具卡，丰富玩法。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        9: { name: '定制规则卡', desc: '个性化游戏规则，独一无二。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] }
    },
    tarot: {
        1: { name: '经典韦特塔罗', desc: '78张标准塔罗牌，适合占卜初学者。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        2: { name: '金色边缘塔罗', desc: '烫金边缘，奢华质感，适合收藏。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        3: { name: '哑光面塔罗', desc: '防反光，手感细腻，长时间使用不疲劳。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        4: { name: '艺术插画塔罗', desc: '原创艺术画风，独特风格。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        5: { name: '迷你塔罗牌', desc: '便携尺寸，旅行版。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        6: { name: '占星主题塔罗', desc: '星座元素设计，占星爱好者首选。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        7: { name: '神话主题塔罗', desc: '希腊/北欧神话，故事感强。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        8: { name: '配套说明书', desc: '多语言指导手册，方便使用。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        9: { name: '礼盒装塔罗', desc: '硬盒包装，磁吸翻盖，高端大气。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] }
    },
    advertising: {
        1: { name: '企业Logo扑克', desc: '公司Logo定制，品牌形象展示。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        2: { name: '活动纪念扑克', desc: '年会/庆典礼品，留念价值高。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        3: { name: '产品宣传扑克', desc: '产品图片展示，营销新方式。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        4: { name: '节日主题扑克', desc: '春节/圣诞限定，节日氛围浓厚。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        5: { name: '房地产楼盘扑克', desc: '楼盘信息推广，潜在客户获取。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        6: { name: '餐厅菜单扑克', desc: '菜品展示+优惠，实用性强。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        7: { name: '旅游景点扑克', desc: '风景照片合集，旅游纪念品。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        8: { name: '教育机构扑克', desc: '课程信息推广，招生利器。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        9: { name: '小批量定制', desc: '100副起订，门槛低。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] }
    },
    kids: {
        1: { name: '启蒙认知套装', desc: '动物+水果+颜色，3合1套装。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        2: { name: '双语学习套装', desc: '中英文对照卡片，语言启蒙。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        3: { name: '拼图游戏卡', desc: '2-4片拼图，锻炼动手能力。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        4: { name: '数字学习套装', desc: '1-20数字+算数，数学基础。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        5: { name: '拼音学习卡', desc: '汉语拼音启蒙，幼小衔接。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        6: { name: '英语字母卡', desc: '大小写字母+单词，英语入门。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        7: { name: '互动问答卡', desc: '亲子问答游戏，增进感情。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        8: { name: '故事场景卡', desc: '看图讲故事，想象力培养。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] },
        9: { name: '音乐启蒙卡', desc: '乐器识别+音符，艺术熏陶。', images: ['img1', 'img2', 'img3', 'img4', 'img5'] }
    }
};

// 获取URL参数
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        product: params.get('product'),
        sample: params.get('sample')
    };
}

let currentImageIndex = 0;
let currentImages = [];
let currentData = null;

// 初始化页面
function initPage() {
    const params = getUrlParams();
    const product = params.product;
    const sampleId = params.sample;
    
    if (!product || !sampleId) {
        // 没有参数，显示错误或返回
        document.getElementById('detailTitle').textContent = '参数错误';
        document.getElementById('detailDesc').textContent = '请从产品页面选择样品';
        return;
    }
    
    const productData = sampleData[product];
    if (!productData || !productData[sampleId]) {
        document.getElementById('detailTitle').textContent = '样品不存在';
        return;
    }
    
    currentData = productData[sampleId];
    currentImages = currentData.images || ['img1', 'img2', 'img3', 'img4', 'img5'];
    
    // 更新标题和描述
    document.getElementById('detailTitle').textContent = currentData.name;
    document.getElementById('detailDesc').textContent = currentData.desc;
    
    // 生成缩略图
    generateThumbnails();
    
    // 显示第一张主图
    currentImageIndex = 0;
    updateMainImage();
}

// 生成缩略图
function generateThumbnails() {
    const container = document.getElementById('thumbnailContainer');
    if (!container) return;
    
    container.innerHTML = '';
    currentImages.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        if (index === 0) thumb.classList.add('active');
        thumb.onclick = () => {
            currentImageIndex = index;
            updateMainImage();
            updateActiveThumbnail();
        };
        thumb.innerHTML = `<i class="fas fa-image"></i>`;
        container.appendChild(thumb);
    });
}

// 更新主图
function updateMainImage() {
    const mainDiv = document.getElementById('mainImage');
    if (!mainDiv) return;
    
    // 使用占位符，后续可替换为真实图片URL
    mainDiv.innerHTML = `
        <div class="main-image-placeholder">
            <i class="fas fa-image" style="font-size: 4rem;"></i>
            <p>样品图片 ${currentImageIndex + 1} / ${currentImages.length}</p>
            <p style="font-size: 12px; margin-top: 10px;">此处可替换为实际产品图片</p>
        </div>
    `;
}

// 更新缩略图激活状态
function updateActiveThumbnail() {
    const thumbs = document.querySelectorAll('.thumbnail');
    thumbs.forEach((thumb, index) => {
        if (index === currentImageIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

// 上一张
function prevImage() {
    if (currentImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateMainImage();
    updateActiveThumbnail();
}

// 下一张
function nextImage() {
    if (currentImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateMainImage();
    updateActiveThumbnail();
}

// 绑定事件
document.addEventListener('DOMContentLoaded', () => {
    initPage();
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', prevImage);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    
    // 键盘左右键支持
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });
});