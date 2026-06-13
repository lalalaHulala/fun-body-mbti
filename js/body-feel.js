/* ========================================
   趣味自测 · 身体感觉自测（8题）
   用日常身体场景替代血常规表单
   每题映射到 E/N/T/P 维度
   ======================================== */

const BODY_FEEL_QUESTIONS = [
  // ===== E维度：能量响应 =====
  {
    id: 'b1', dim: 'EI',
    text: '感冒发烧39度，第二天有个重要会议。你？',
    options: [
      { text: '🥶 "不行了不行了，请假保命"——果断躺平，天塌了也要睡', score: -3 },
      { text: '😷 "吃颗药顶一顶，开完会再说"——灌杯热水就出门了', score: 0 },
      { text: '🔥 "39度？我还能再战五百年"——完全没觉得自己在生病', score: 3 },
    ]
  },
  {
    id: 'b2', dim: 'EI',
    text: '手上划了一道口子，你的第一反应？',
    options: [
      { text: '🩹 "创可贴碘伏消毒三连"——处理得比护士还专业', score: 3 },
      { text: '🤔 "有点疼……算了不管它"——舔一舔，过两天自己好了', score: -3 },
    ]
  },

  // ===== N维度：波动敏感 =====
  {
    id: 'b3', dim: 'SN',
    text: '换季了。你的身体怎么反应？',
    options: [
      { text: '😎 "换季？什么是换季？"——身体根本没感觉，四季如常', score: -3 },
      { text: '😤 "准时开始打喷嚏流鼻涕起疹子"——比天气预报还准', score: 3 },
      { text: '🤧 "有时候有反应有时候没有"——看运气，不好说', score: 0 },
    ]
  },
  {
    id: 'b4', dim: 'SN',
    text: '昨晚只睡了4小时，今天的状态？',
    options: [
      { text: '☕ "一杯咖啡就复活了"——影响不大，该干嘛干嘛', score: -3 },
      { text: '💀 "整个人像被卡车碾过"——一整天废了，只想躺着', score: 3 },
    ]
  },

  // ===== T维度：控制模式 =====
  {
    id: 'b5', dim: 'TF',
    text: '胃有点不舒服，但不严重。你？',
    options: [
      { text: '📋 "辣的冰的今晚全戒，泡杯养生茶"——立刻启动健康模式', score: 3 },
      { text: '🌶️ "可能是饿了？再吃碗麻辣烫试试"——身体归身体，我归我', score: -3 },
    ]
  },
  {
    id: 'b6', dim: 'TF',
    text: '牙疼了一周了。你的行动是？',
    options: [
      { text: '🦷 "第二天就约了牙医，直接拔了"——问题不过夜，立刻处理', score: 3 },
      { text: '😬 "再等等吧，说不定自己就不疼了呢"——能拖则拖，忍到忍不了再说', score: -3 },
    ]
  },

  // ===== P维度：策略模式 =====
  {
    id: 'b7', dim: 'JP',
    text: '朋友推荐了三种治失眠的方法：泡脚、白噪音、褪黑素。你？',
    options: [
      { text: '🧪 "三种一起来！总有一种管用"——多线作战，宁可多用不错过', score: 3 },
      { text: '🎯 "选一种先试一周，没效果再换"——单线深入，不贪多', score: -3 },
    ]
  },
  {
    id: 'b8', dim: 'JP',
    text: '偏方对你来说？',
    options: [
      { text: '📖 "只信说明书和医生说的"——偏方？算了吧', score: -3 },
      { text: '🧙 "姜汤泡脚艾灸精油什么都试，万一有用呢"——来者不拒，身体是试验田', score: 3 },
    ]
  },
];

// ===== 身体感觉计分器：8题映射到 E/N/T/P =====
const BodyFeelScorer = {
  calculate(answers) {
    const dimScores = { EI: 0, SN: 0, TF: 0, JP: 0 };
    const dimCounts  = { EI: 0, SN: 0, TF: 0, JP: 0 };

    for (const q of BODY_FEEL_QUESTIONS) {
      const score = answers[q.id] || 0;
      dimScores[q.dim] += score;
      dimCounts[q.dim]++;
    }

    // 归一化：每维度2题，每题-3~+3，总分-6~+6
    const dimMap = {
      EI: { high: 'E', low: 'I' },
      SN: { high: 'S', low: 'N' },
      TF: { high: 'T', low: 'F' },
      JP: { high: 'J', low: 'P' },
    };

    const dimensions = {};
    for (const [dim, score] of Object.entries(dimScores)) {
      const value = score > 0 ? dimMap[dim].high : dimMap[dim].low;
      const maxAbs = dimCounts[dim] * 3;
      const percent = Math.round(((score + maxAbs) / (2 * maxAbs)) * 100);
      dimensions[dim] = {
        score,
        value,
        percent: Math.max(5, Math.min(95, percent)),
      };
    }

    const bodyType = dimensions.EI.value + dimensions.SN.value + dimensions.TF.value + dimensions.JP.value;

    return { bodyType, dimensions, rawScores: dimScores };
  }
};
