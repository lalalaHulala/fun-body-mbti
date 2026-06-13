/**
 * 趣味自测 · 身体性格双重MBTI — 后端服务
 * 部署目标: Railway / Render
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ===== 静态文件服务（生产环境） =====
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '..')));
}

// ===== DeepSeek API 客户端 =====
const OpenAI = require('openai');
let aiClient = null;

function getAIClient() {
  if (aiClient) return aiClient;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;
  aiClient = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: apiKey,
  });
  return aiClient;
}

// ===== API 路由 =====

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 计算身体类型（后端复现前端引擎逻辑，保证离线也可用）
app.post('/api/calculate-body', (req, res) => {
  try {
    let { wbc, neutPct, lymphPct, monoPct, eosPct, hgb, plt, crp, gender, volatilityAux } = req.body;

    // 默认值处理
    gender = gender || 'M';
    wbc = wbc || 6.5;
    neutPct = neutPct || 55;
    lymphPct = lymphPct || 35;
    monoPct = monoPct || 7;
    eosPct = eosPct || 3;
    hgb = hgb || (gender === 'F' ? 135 : 150);
    plt = plt || 250;
    crp = crp || 2;
    volatilityAux = volatilityAux || 3;

    const zScore = (val, mean, sd) => (val - mean) / sd;

    const norms = {
      WBC:   { mean: 6.5, sd: 1.5 },
      NEUT:  { mean: 55,  sd: 10 },
      LYMPH: { mean: 35,  sd: 7 },
      MONO:  { mean: 7,   sd: 2 },
      EOS:   { mean: 3,   sd: 2 },
      HGB_M: { mean: 150, sd: 12 },
      HGB_F: { mean: 135, sd: 12 },
      PLT:   { mean: 250, sd: 65 },
      CRP:   { mean: 2,   sd: 3 },
    };

    const z = {
      WBC:   zScore(wbc, norms.WBC.mean, norms.WBC.sd),
      NEUT:  zScore(neutPct, norms.NEUT.mean, norms.NEUT.sd),
      LYMPH: zScore(lymphPct, norms.LYMPH.mean, norms.LYMPH.sd),
      MONO:  zScore(monoPct, norms.MONO.mean, norms.MONO.sd),
      EOS:   zScore(eosPct, norms.EOS.mean, norms.EOS.sd),
      HGB:   zScore(hgb, gender === 'F' ? norms.HGB_F.mean : norms.HGB_M.mean, gender === 'F' ? norms.HGB_F.sd : norms.HGB_M.sd),
      PLT:   zScore(plt, norms.PLT.mean, norms.PLT.sd),
      CRP:   zScore(crp, norms.CRP.mean, norms.CRP.sd),
    };

    const eScore = 0.4 * z.WBC + 0.4 * z.NEUT + 0.2 * z.CRP;

    const valsForN = [z.WBC, z.NEUT, z.LYMPH, z.MONO, z.EOS, z.HGB, z.PLT];
    const meanN = valsForN.reduce((a, b) => a + b, 0) / valsForN.length;
    const varN = valsForN.reduce((s, v) => s + (v - meanN) ** 2, 0) / valsForN.length;
    const internalDispersion = Math.sqrt(varN);
    const auxZ = (volatilityAux - 3) / 1.0;
    const nScore = 0.5 * internalDispersion + 0.5 * auxZ;

    const tScore = 0.4 * z.LYMPH + 0.3 * (-Math.abs(z.HGB)) + 0.3 * z.PLT;

    const diversityIndex = (lymphPct + monoPct + eosPct) / wbc;
    const diMean = (35 + 7 + 3) / 6.5;
    const diSd = 1.5;
    const pScore = zScore(diversityIndex, diMean, diSd);

    const bodyType =
      (eScore >= 0 ? 'E' : 'I') +
      (nScore >= 0 ? 'N' : 'S') +
      (tScore >= 0 ? 'T' : 'F') +
      (pScore >= 0 ? 'P' : 'J');

    const toPercent = (zVal) => Math.round(((Math.max(-3, Math.min(3, zVal)) + 3) / 6) * 90 + 5);

    res.json({
      bodyType,
      dimensions: {
        EI: { score: eScore, value: eScore >= 0 ? 'E' : 'I', percent: toPercent(eScore) },
        SN: { score: nScore, value: nScore >= 0 ? 'N' : 'S', percent: toPercent(nScore) },
        TF: { score: tScore, value: tScore >= 0 ? 'T' : 'F', percent: toPercent(tScore) },
        JP: { score: pScore, value: pScore >= 0 ? 'P' : 'J', percent: toPercent(pScore) },
      },
      zScores: z,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// AI 交叉解读
app.post('/api/ai-cross-reading', async (req, res) => {
  try {
    const { bodyType, mindType, bodyReport, mindReport, bloodSummary } = req.body;

    if (!bodyType || !mindType) {
      return res.status(400).json({ error: '缺少身体类型或性格类型' });
    }

    const client = getAIClient();
    if (!client) {
      // 无 API key 时返回静态融合文本
      return res.json({ text: generateStaticFusion(bodyType, mindType, bodyReport, mindReport) });
    }

    const systemPrompt = `你是一位身心兼修的健康顾问，擅长将免疫医学与心理学融合解读。你的语言风趣幽默但不失专业，善于用生动的比喻帮助普通人理解复杂的身体-心理关联。你从不给出确切的医疗建议，而是以启发式的方式引导用户关注自身健康。`;

    const userPrompt = `请根据以下两份报告，分析其身体免疫特质与心理性格之间的相互作用，给出独特的融合解读。

【身体免疫类型】${bodyType}
${bodyReport || '无详细报告'}

【心理性格类型】${mindType}
${mindReport || '无详细报告'}

【血液指标摘要】
${bloodSummary || '无'}

请生成 800 字左右的解读，包含以下三个小节：
1. **身心矛盾点**：身体免疫特质与心理性格之间可能存在的冲突或张力
2. **协同优势**：两者配合默契、相得益彰的方面
3. **调和建议**：如何让身心更好地协同，提升整体健康与幸福感

语言要求风趣易读，适当使用 emoji，让读者感到被理解和被启发。`;

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    const text = completion.choices[0]?.message?.content || 'AI 暂时无法生成解读，请稍后重试。';
    res.json({ text });
  } catch (err) {
    console.error('AI 解读失败:', err.message);
    // 降级到静态融合
    res.json({ text: 'AI 解读服务暂时不可用，请稍后重试。以下为预设解读：\n\n' + generateStaticFusionSimple(req.body.bodyType, req.body.mindType) });
  }
});

// ===== 静态融合文本（无 AI 时的降级方案） =====
function generateStaticFusion(bodyType, mindType, bodyReport, mindReport) {
  return generateStaticFusionSimple(bodyType, mindType);
}

function generateStaticFusionSimple(bodyType, mindType) {
  const bodyTags = {
    ISTJ: '稳态守护者', ISFJ: '温和守望者', INFJ: '深度调和者', INTJ: '精准战略家',
    ISTP: '延迟七日体', ISFP: '柔韧艺术家', INFP: '理想调停者', INTP: '逻辑解构者',
    ESTP: '闪电反应者', ESFP: '活跃表演家', ENFP: '免疫探险家', ENTP: '创新挑战者',
    ESTJ: '高效指挥官', ESFJ: '和谐协调者', ENFJ: '魅力引导者', ENTJ: '强势统率者',
  };
  const mindTags = {
    ISTJ: '物流师', ISFJ: '守卫者', INFJ: '提倡者', INTJ: '建筑师',
    ISTP: '鉴赏家', ISFP: '探险家', INFP: '调停者', INTP: '逻辑学家',
    ESTP: '企业家', ESFP: '表演者', ENFP: '竞选者', ENTP: '辩论家',
    ESTJ: '总经理', ESFJ: '执政官', ENFJ: '主人公', ENTJ: '指挥官',
  };

  const bTag = bodyTags[bodyType] || bodyType;
  const mTag = mindTags[mindType] || mindType;

  return [
    `### 🌟 你的双重密码：${bTag} × ${mTag}`,
    '',
    `**身体类型**：${bodyType}「${bTag}」  |  **性格类型**：${mindType}「${mTag}」`,
    '',
    '---',
    '',
    '### 🔄 身心矛盾点',
    '',
    `你的身体免疫系统与性格之间可能存在微妙的张力。身体层面，${bodyType} 型免疫有其独特的反应模式；而在心理层面，${mindType} 型的思维和情感倾向会以不同的方式影响你的生理状态。`,
    '当身体倾向于保守防御时，性格可能驱使你不断突破边界；当身体渴望稳定节奏时，心理可能追求新鲜刺激。这种"身心对话"是你独特个性的一部分。',
    '',
    '### 🤝 协同优势',
    '',
    `有趣的是，${bodyType} 和 ${mindType} 的组合也带来了独特的优势。你的身体免疫特质与性格特征在某些方面形成了互补——一方谨慎时另一方勇敢，一方细腻时另一方果断。`,
    '这种双系统协作让你在应对压力和挑战时拥有更多"武器"。你的直觉可能比常人更敏锐地感知身体的微小变化，而你的身体也以独特的方式支持着你的心理追求。',
    '',
    '### 💡 调和建议',
    '',
    '1. **倾听身体信号**：当感到疲惫或不适时，不要仅靠意志力硬撑——你的身体有自己的"语言"',
    '2. **利用性格优势**：发挥你性格中的觉察力，定期"扫描"身体状态',
    '3. **建立身心仪式**：每天留出 10 分钟，在安静中感受呼吸和身体各部位的感受',
    '4. **弹性生活方式**：尊重身体的节律，同时保持心理的开放和灵活性',
    '',
    `> 💬 想要更深入的个性化解读？请点击「AI 深度解读」按钮获取 AI 生成的专属分析。`,
  ].join('\n');
}

// ===== 启动服务 =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🧬 身体性格双重MBTI 服务已启动: http://localhost:${PORT}`);
  console.log(`   AI 服务: ${process.env.DEEPSEEK_API_KEY ? '✅ DeepSeek 已配置' : '⚠️ 未配置（使用静态降级）'}`);
});
