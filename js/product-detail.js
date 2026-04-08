// 产品详情页脚本 - 生成9宫格样品

// 产品配置数据
const productConfig = {
    laser: {
        name: '镭射卡系列 / Holographic Cards',
        description: '全息镭射、烫金、UV效果。适用于高端礼品及收藏卡牌。支持多种镭射效果：全息、局部、纹理镭射。',
        samples: [
            { id: 1, name: '全息镭射卡 - 星空', desc: '星空效果全息镭射，璀璨夺目' },
            { id: 2, name: '全息镭射卡 - 彩虹', desc: '彩虹渐变镭射效果' },
            { id: 3, name: '局部镭射卡 - 文字', desc: '局部文字镭射，精致典雅' },
            { id: 4, name: '局部镭射卡 - 图案', desc: '局部图案镭射，突出重点' },
            { id: 5, name: '纹理镭射卡 - 网格', desc: '网格纹理镭射，科技感十足' },
            { id: 6, name: '纹理镭射卡 - 波浪', desc: '波浪纹理镭射，动感时尚' },
            { id: 7, name: '烫金+镭射复合卡', desc: '烫金与镭射工艺结合' },
            { id: 8, name: 'UV+镭射复合卡', desc: 'UV光油加镭射效果' },
            { id: 9, name: '定制图案镭射卡', desc: '根据客户图案定制镭射效果' }
        ]
    },
    flashcards: {
        name: '学习卡片与闪卡 / Flashcards & Learning Cards',
        description: '圆角设计、覆膜防水，安全环保。适用于早教及语言学习。覆膜防水、圆角安全设计。',
        samples: [
            { id: 1, name: '字母认知闪卡', desc: '26个字母，彩色印刷' },
            { id: 2, name: '数字学习卡', desc: '1-100数字，中英文对照' },
            { id: 3, name: '动物认知卡', desc: '常见动物图案+名称' },
            { id: 4, name: '水果蔬菜卡', desc: '健康饮食启蒙' },
            { id: 5, name: '颜色形状卡', desc: '基础颜色与形状认知' },
            { id: 6, name: '日常用语卡', desc: '生活常用词汇' },
            { id: 7, name: '英语单词卡', desc: '小学英语词汇' },
            { id: 8, name: '数学运算卡', desc: '加减乘除练习' },
            { id: 9, name: '记忆训练卡', desc: '配对游戏卡片' }
        ]
    },
    playingcards: {
        name: '扑克牌系列 / Playing Cards',
        description: '定制扑克、广告扑克。多种表面处理工艺与包装选择。定制扑克、广告扑克、文创扑克。',
        samples: [
            { id: 1, name: '标准扑克牌', desc: '54张标准尺寸，光面处理' },
            { id: 2, name: '桥牌尺寸扑克', desc: '窄版设计，便于手握' },
            { id: 3, name: '广告扑克牌', desc: '企业Logo定制' },
            { id: 4, name: '文创扑克牌', desc: '艺术插画风格' },
            { id: 5, name: '黑芯纸扑克', desc: '防透视，赌场级品质' },
            { id: 6, name: '塑料扑克牌', desc: '防水耐用' },
            { id: 7, name: '磨砂面扑克', desc: '哑光质感' },
            { id: 8, name: '金边扑克牌', desc: '金色边缘，奢华版' },
            { id: 9, name: '收藏版扑克', desc: '限量编号，礼盒包装' }
        ]
    },
    boardgames: {
        name: '桌游牌与游戏卡片 / Board Game Cards',
        description: '自定义尺寸、规则与卡面设计。适用于家庭游戏及策略卡牌。儿童桌游、成人策略卡牌、亲子互动游戏。',
        samples: [
            { id: 1, name: 'UNO风格卡牌', desc: '经典桌游卡牌尺寸' },
            { id: 2, name: '策略游戏卡牌', desc: 'TCG/CCG卡牌标准' },
            { id: 3, name: '亲子互动卡', desc: '家庭游戏，安全材质' },
            { id: 4, name: '角色扮演卡', desc: 'RPG游戏角色卡' },
            { id: 5, name: '问答游戏卡', desc: '知识竞赛卡片' },
            { id: 6, name: '动作游戏卡', desc: '肢体互动游戏' },
            { id: 7, name: '记忆配对卡', desc: '翻牌配对游戏' },
            { id: 8, name: '桌游配件卡', desc: '游戏币、道具卡' },
            { id: 9, name: '定制规则卡', desc: '个性化游戏规则' }
        ]
    },
    tarot: {
        name: '塔罗牌 / Tarot Cards',
        description: '高端印刷、手感舒适。配套定制包装盒及说明书。高端印刷、精美卡面、手感舒适。',
        samples: [
            { id: 1, name: '经典韦特塔罗', desc: '78张标准塔罗牌' },
            { id: 2, name: '金色边缘塔罗', desc: '烫金边缘，奢华质感' },
            { id: 3, name: '哑光面塔罗', desc: '防反光，手感细腻' },
            { id: 4, name: '艺术插画塔罗', desc: '原创艺术画风' },
            { id: 5, name: '迷你塔罗牌', desc: '便携尺寸，旅行版' },
            { id: 6, name: '占星主题塔罗', desc: '星座元素设计' },
            { id: 7, name: '神话主题塔罗', desc: '希腊/北欧神话' },
            { id: 8, name: '配套说明书', desc: '多语言指导手册' },
            { id: 9, name: '礼盒装塔罗', desc: '硬盒包装，磁吸翻盖' }
        ]
    },
    advertising: {
        name: '广告定制扑克牌 / Advertising Cards',
        description: '企业宣传、活动礼品。支持小批量定制，快速打样。企业宣传、活动礼品、品牌推广。',
        samples: [
            { id: 1, name: '企业Logo扑克', desc: '公司Logo定制' },
            { id: 2, name: '活动纪念扑克', desc: '年会/庆典礼品' },
            { id: 3, name: '产品宣传扑克', desc: '产品图片展示' },
            { id: 4, name: '节日主题扑克', desc: '春节/圣诞限定' },
            { id: 5, name: '房地产楼盘扑克', desc: '楼盘信息推广' },
            { id: 6, name: '餐厅菜单扑克', desc: '菜品展示+优惠' },
            { id: 7, name: '旅游景点扑克', desc: '风景照片合集' },
            { id: 8, name: '教育机构扑克', desc: '课程信息推广' },
            { id: 9, name: '小批量定制', desc: '100副起订' }
        ]
    },
    kids: {
        name: '儿童启蒙套装 / Kids Educational Sets',
        description: '环保油墨、安全材质。拼图卡、认知卡、互动游戏套装。环保油墨，安全材质。',
        samples: [
            { id: 1, name: '启蒙认知套装', desc: '动物+水果+颜色' },
            { id: 2, name: '双语学习套装', desc: '中英文对照卡片' },
            { id: 3, name: '拼图游戏卡', desc: '2-4片拼图' },
            { id: 4, name: '数字学习套装', desc: '1-20数字+算数' },
            { id: 5, name: '拼音学习卡', desc: '汉语拼音启蒙' },
            { id: 6, name: '英语字母卡', desc: '大小写字母+单词' },
            { id: 7, name: '互动问答卡', desc: '亲子问答游戏' },
            { id: 8, name: '故事场景卡', desc: '看图讲故事' },
            { id: 9, name: '音乐启蒙卡', desc: '乐器识别+音符' }
        ]
    }
};

// 获取当前产品类型（从页面文件名判断）
function getCurrentProductType() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    const typeMap = {
        'laser.html': 'laser',
        'flashcards.html': 'flashcards',
        'playingcards.html': 'playingcards',
        'boardgames.html': 'boardgames',
        'tarot.html': 'tarot',
        'advertising.html': 'advertising',
        'kids.html': 'kids'
    };
    return typeMap[filename] || 'laser';
}

// 生成9宫格样品
function generateSampleGrid() {
    const productType = getCurrentProductType();
    const config = productConfig[productType];
    
    if (!config) return;
    
    // 更新页面标题和描述
    const titleEl = document.getElementById('productTitle');
    const descEl = document.getElementById('productDescription');
    if (titleEl) titleEl.textContent = config.name;
    if (descEl) descEl.textContent = config.description;
    
    // 生成9宫格
    const grid = document.getElementById('sampleGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    config.samples.forEach(sample => {
        const card = document.createElement('div');
        card.className = 'sample-card';
        card.onclick = () => {
            // 跳转到产品明细页面
            window.location.href = `../product-detail.html?product=${productType}&sample=${sample.id}`;
        };
        card.innerHTML = `
            <div class="sample-img">
                <i class="fas fa-image"></i>
            </div>
            <div class="sample-info">
                <h4>${sample.name}</h4>
                <p>${sample.desc}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 页面加载时生成
document.addEventListener('DOMContentLoaded', () => {
    generateSampleGrid();
});