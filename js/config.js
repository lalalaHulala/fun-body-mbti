/* ========================================
   全局配置 & 血常规常模数据
   ======================================== */

// ===== 血常规成人常模 =====
const BLOOD_NORMS = {
  WBC:   { mean: 6.5, sd: 1.5, unit: '10^9/L', label: '白细胞计数' },
  NEUT:  { mean: 55,  sd: 10,  unit: '%',      label: '中性粒细胞百分比' },
  LYMPH: { mean: 35,  sd: 7,   unit: '%',      label: '淋巴细胞百分比' },
  MONO:  { mean: 7,   sd: 2,   unit: '%',      label: '单核细胞百分比' },
  EOS:   { mean: 3,   sd: 2,   unit: '%',      label: '嗜酸性粒细胞百分比' },
  HGB_M: { mean: 150, sd: 12,  unit: 'g/L',    label: '血红蛋白(男)' },
  HGB_F: { mean: 135, sd: 12,  unit: 'g/L',    label: '血红蛋白(女)' },
  PLT:   { mean: 250, sd: 65,  unit: '10^9/L', label: '血小板计数' },
  CRP:   { mean: 2,   sd: 3,   unit: 'mg/L',   label: 'C反应蛋白' },
};

// ===== 性格维度信息（基于E/N/T/P体系） =====
const MBTI_DIMS = {
  EI: { high: 'E', low: 'I', highName: '高响应型', lowName: '低响应型', label: '能量响应' },
  SN: { high: 'S', low: 'N', highName: '稳态型',   lowName: '波动敏感型', label: '稳定适应' },
  TF: { high: 'T', low: 'F', highName: '结构化型', lowName: '随性灵活型', label: '决策控制' },
  JP: { high: 'J', low: 'P', highName: '专注型',   lowName: '多线探索型', label: '策略模式' },
};

// ===== 身体维度公式权重 =====
const BODY_WEIGHTS = {
  E: { WBC: 0.4, NEUT: 0.4, CRP: 0.2 },
  T: { LYMPH: 0.4, HGB_stability: 0.3, PLT: 0.3 },
  // P 由多样性指数计算，N 由变异系数+辅助问题计算
};

// ===== API 配置 =====
const API_CONFIG = {
  baseURL: window.location.origin + '/api',
  aiProvider: 'openai',  // 'openai' | 'claude' | 'deepseek'
  aiModel: 'gpt-4o-mini',
};
