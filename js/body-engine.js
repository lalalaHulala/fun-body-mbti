/* ========================================
   身体类型计算引擎
   基于血常规指标 + z-score 映射到 MBTI 维度
   ======================================== */

const BodyEngine = {

  /**
   * 计算 z-score
   */
  zScore(value, mean, sd) {
    if (sd === 0) return 0;
    return (value - mean) / sd;
  },

  /**
   * 解析血常规输入数据
   * @param {Object} input - { wbc, neutPct, lymphPct, monoPct, eosPct, hgb, plt, crp, gender }
   */
  parseBloodData(input) {
    const gender = input.gender || 'M';
    const hgbMean = gender === 'F' ? BLOOD_NORMS.HGB_F.mean : BLOOD_NORMS.HGB_M.mean;
    const hgbSd   = gender === 'F' ? BLOOD_NORMS.HGB_F.sd   : BLOOD_NORMS.HGB_M.sd;

    const zScores = {
      WBC:   this.zScore(input.wbc || 6.5,          BLOOD_NORMS.WBC.mean,   BLOOD_NORMS.WBC.sd),
      NEUT:  this.zScore(input.neutPct || 55,        BLOOD_NORMS.NEUT.mean,  BLOOD_NORMS.NEUT.sd),
      LYMPH: this.zScore(input.lymphPct || 35,       BLOOD_NORMS.LYMPH.mean, BLOOD_NORMS.LYMPH.sd),
      MONO:  this.zScore(input.monoPct || 7,          BLOOD_NORMS.MONO.mean,  BLOOD_NORMS.MONO.sd),
      EOS:   this.zScore(input.eosPct || 3,           BLOOD_NORMS.EOS.mean,   BLOOD_NORMS.EOS.sd),
      HGB:   this.zScore(input.hgb || (gender === 'F' ? 135 : 150), hgbMean, hgbSd),
      PLT:   this.zScore(input.plt || 250,            BLOOD_NORMS.PLT.mean,   BLOOD_NORMS.PLT.sd),
      CRP:   this.zScore(input.crp || 2,              BLOOD_NORMS.CRP.mean,   BLOOD_NORMS.CRP.sd),
    };

    return { raw: input, zScores, gender };
  },

  /**
   * 计算 E 维度：免疫反应强度
   * E = 0.4*zWBC + 0.4*zNEUT + 0.2*zCRP
   * 得分高 → E（外向免疫），得分低 → I（内向免疫）
   */
  calcE(zScores) {
    return 0.4 * zScores.WBC + 0.4 * zScores.NEUT + 0.2 * zScores.CRP;
  },

  /**
   * 计算 N 维度：波动指数
   * 基于各指标 z-score 的标准差（内部离散度）+ 辅助健康问卷
   * @param {Object} zScores
   * @param {number} volatilityAux - 辅助问题得分 (1-5, 越高越波动)
   */
  calcN(zScores, volatilityAux = 3) {
    const vals = [
      zScores.WBC, zScores.NEUT, zScores.LYMPH,
      zScores.MONO, zScores.EOS, zScores.HGB, zScores.PLT
    ];
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / vals.length;
    const internalDispersion = Math.sqrt(variance);

    // 辅助问题归一化: 1-5 → z-score-like (-2 到 +2)
    const auxZ = (volatilityAux - 3) / 1.0;

    // 综合: 内部离散度(50%) + 辅助问卷(50%)
    return 0.5 * internalDispersion + 0.5 * auxZ;
  },

  /**
   * 计算 T 维度：机制化控制能力
   * T = 0.4*zLYMPH + 0.3*(-|zHGB|) + 0.3*zPLT
   * 得分高 → T（控制型免疫），得分低 → F（适应型免疫）
   */
  calcT(zScores) {
    const hgbStability = -Math.abs(zScores.HGB); // HGB越偏离均值，稳定性越差
    return 0.4 * zScores.LYMPH + 0.3 * hgbStability + 0.3 * zScores.PLT;
  },

  /**
   * 计算 P 维度：多路径适应性
   * 多样性指数 = (LYMPH% + MONO% + EOS%) / WBC
   * 然后对多样性指数做 z-score
   */
  calcP(raw) {
    const lymphPct = raw.lymphPct || 35;
    const monoPct  = raw.monoPct  || 7;
    const eosPct   = raw.eosPct   || 3;
    const wbc      = raw.wbc      || 6.5;

    const diversityIndex = (lymphPct + monoPct + eosPct) / wbc;

    // 多样性指数常模（基于典型值估算）
    const diMean = (35 + 7 + 3) / 6.5;  // ≈ 6.92
    const diSd   = 1.5;
    return this.zScore(diversityIndex, diMean, diSd);
  },

  /**
   * 综合计算身体 MBTI 类型
   * @param {Object} bloodInput - 血常规输入
   * @param {number} volatilityAux - 波动辅助评分 (1-5)
   * @returns {Object} 完整计算结果
   */
  calculate(bloodInput, volatilityAux = 3) {
    const parsed = this.parseBloodData(bloodInput);
    const { zScores, raw, gender } = parsed;

    const eScore = this.calcE(zScores);
    const nScore = this.calcN(zScores, volatilityAux);
    const tScore = this.calcT(zScores);
    const pScore = this.calcP(raw);

    // 判定维度：>= 0 → 高维，< 0 → 低维
    const dimE = eScore >= 0 ? 'E' : 'I';
    const dimN = nScore >= 0 ? 'N' : 'S';
    const dimT = tScore >= 0 ? 'T' : 'F';
    const dimP = pScore >= 0 ? 'P' : 'J';

    const bodyType = dimE + dimN + dimT + dimP;

    return {
      bodyType,
      dimensions: {
        EI: { score: eScore, value: dimE, label: dimE === 'E' ? '外向免疫' : '内向免疫', percent: this.scoreToPercent(eScore) },
        SN: { score: nScore, value: dimN, label: dimN === 'N' ? '高波动型' : '稳态型',   percent: this.scoreToPercent(nScore) },
        TF: { score: tScore, value: dimT, label: dimT === 'T' ? '控制型免疫' : '适应型免疫', percent: this.scoreToPercent(tScore) },
        JP: { score: pScore, value: dimP, label: dimP === 'P' ? '多路径型' : '专一型',   percent: this.scoreToPercent(pScore) },
      },
      zScores,
      raw,
    };
  },

  /**
   * 将 z-score 映射到 0-100 的百分比显示
   */
  scoreToPercent(z) {
    // sigmoid-like: 将 z∈[-3,3] 映射到 [5%, 95%]
    const clamped = Math.max(-3, Math.min(3, z));
    return Math.round(((clamped + 3) / 6) * 90 + 5);
  },

  /**
   * 生成身体类型摘要文本
   */
  summarize(result) {
    const d = result.dimensions;
    return {
      immuneStyle: d.EI.value === 'E' ? '免疫系统反应积极、外向' : '免疫系统反应内敛、保守',
      stability:   d.SN.value === 'N' ? '身体状态波动较大，对环境变化敏感' : '身体状态稳定，内环境平衡能力强',
      controlMode: d.TF.value === 'T' ? '免疫控制机制化、有规律' : '免疫灵活适应，以柔克刚',
      adaptability: d.JP.value === 'P' ? '免疫多路径应对，策略丰富' : '免疫专一高效，精准打击',
    };
  }
};

// 导出（兼容模块化）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BodyEngine;
}
