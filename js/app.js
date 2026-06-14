/* ========================================
   趣味自测 · 身体性格双重MBTI — 前端主逻辑
   流程：欢迎 → 身体感觉8题 → 性格20题 → 结果
   ======================================== */

const app = {
  state: {
    screen: 'welcome',
    bodyFeelAnswers: {},
    bodyFeelIdx: 0,
    bodyResult: null,
    bodySkipped: false,
    mbtiAnswers: {},
    mbtiCurrentIdx: 0,
    mindResult: null,
    aiText: null,
  },

  init() {
    this.showScreen('welcome');
  },

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('active');
    this.state.screen = name;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ===== 开始测试 → 选择方式 =====
  startTest() {
    this.state.bodyFeelAnswers = {};
    this.state.bodyFeelIdx = 0;
    this.state.bloodInput = {};
    this.state.bodySkipped = false;
    this.state.bloodMode = null; // 'feel' | 'blood'
    this.state.mbtiAnswers = {};
    this.state.mbtiCurrentIdx = 0;
    this.state.bodyResult = null;
    this.state.mindResult = null;
    this.state.aiText = null;
    this.showScreen('choose');
  },

  // ===== 选身体问卷 =====
  startBodyFeel() {
    this.state.bloodMode = 'feel';
    this.state.bodyFeelAnswers = {};
    this.state.bodyFeelIdx = 0;
    this.showScreen('body-feel');
    this.renderBodyFeelQuestion();
  },

  // ===== 选血常规 =====
  startBlood() {
    this.state.bloodMode = 'blood';
    this.showScreen('blood');
  },

  // ===== 血常规提交 =====
  submitBloodForm() {
    const getVal = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.value) || undefined : undefined; };
    const input = {
      gender: document.querySelector('input[name="gender"]:checked')?.value || 'M',
      wbc: getVal('inp-wbc'), neutPct: getVal('inp-neut'), lymphPct: getVal('inp-lymph'),
      monoPct: getVal('inp-mono'), eosPct: getVal('inp-eos'), hgb: getVal('inp-hgb'),
      plt: getVal('inp-plt'), crp: getVal('inp-crp'),
    };
    this.state.bloodInput = input;
    this.state.bodyResult = BodyEngine.calculate(input, 3);
    this.state.mbtiCurrentIdx = 0;
    this.state.mbtiAnswers = {};
    this.showScreen('mbti');
    this.renderMbtiQuestion();
  },

  // ===== 跳过身体 → 仅性格 =====
  skipBody() {
    this.state.bodySkipped = true;
    this.state.bodyResult = null;
    this.state.mbtiCurrentIdx = 0;
    this.state.mbtiAnswers = {};
    this.showScreen('mbti');
    this.renderMbtiQuestion();
  },

  // ===== 身体感觉题渲染 =====
  renderBodyFeelQuestion() {
    const idx = this.state.bodyFeelIdx;
    const q = BODY_FEEL_QUESTIONS[idx];
    if (!q) return;

    document.getElementById('body-feel-step').textContent = `${idx + 1} / ${BODY_FEEL_QUESTIONS.length}`;
    document.getElementById('body-feel-progress').style.width =
      `${((idx + 1) / BODY_FEEL_QUESTIONS.length) * 100}%`;
    document.getElementById('body-feel-qtext').textContent = q.text;

    const savedVal = this.state.bodyFeelAnswers[q.id] ?? null;
    const optionsEl = document.getElementById('body-feel-options');

    optionsEl.innerHTML = q.options.map((opt, i) => `
      <button class="option-btn body-option ${savedVal === opt.score ? 'selected' : ''}"
              onclick="app.selectBodyOption('${q.id}', ${opt.score})">
        <span>${opt.text}</span>
      </button>
    `).join('');

    document.getElementById('body-feel-nav').style.display = idx > 0 ? 'block' : 'none';
  },

  selectBodyOption(qid, score) {
    this.state.bodyFeelAnswers[qid] = score;

    const idx = this.state.bodyFeelIdx;
    if (idx < BODY_FEEL_QUESTIONS.length - 1) {
      this.state.bodyFeelIdx++;
      this.renderBodyFeelQuestion();
    } else {
      this.finishBodyFeel();
    }
  },

  prevBodyFeel() {
    if (this.state.bodyFeelIdx > 0) {
      this.state.bodyFeelIdx--;
      this.renderBodyFeelQuestion();
    }
  },

  finishBodyFeel() {
    this.state.bodyResult = BodyFeelScorer.calculate(this.state.bodyFeelAnswers);
    this.state.mbtiCurrentIdx = 0;
    this.state.mbtiAnswers = {};
    this.showScreen('mbti');
    this.renderMbtiQuestion();
  },

  // ===== 性格题渲染 =====
  renderMbtiQuestion() {
    const idx = this.state.mbtiCurrentIdx;
    const q = MBTI_QUESTIONNAIRE[idx];
    if (!q) return;

    document.getElementById('mbti-step').textContent = `${idx + 1} / ${MBTI_QUESTIONNAIRE.length}`;
    document.getElementById('mbti-progress').style.width =
      `${((idx + 1) / MBTI_QUESTIONNAIRE.length) * 100}%`;

    document.getElementById('mbti-qnum').textContent = `Q${q.id}`;
    document.getElementById('mbti-qtext').innerHTML = `
      <div class="scene-text">${q.scene}</div>
      <div class="question-text">${q.question}</div>
    `;

    const savedVal = this.state.mbtiAnswers[q.id] ?? null;
    const optionsEl = document.getElementById('mbti-options');

    optionsEl.innerHTML = `
      <div class="scene-options">
        <button class="scene-opt left ${savedVal !== null && savedVal <= -1 ? 'picked' : ''}"
                onclick="app.selectMbtiAnswer(${q.id}, -2)">
          <span class="scene-opt-icon">👈</span>
          <span>${q.left}</span>
        </button>
        <button class="scene-opt mid ${savedVal === 0 ? 'picked' : ''}"
                onclick="app.selectMbtiAnswer(${q.id}, 0)">
          <span>🤷 看情况吧</span>
        </button>
        <button class="scene-opt right ${savedVal !== null && savedVal >= 1 ? 'picked' : ''}"
                onclick="app.selectMbtiAnswer(${q.id}, 2)">
          <span>${q.right}</span>
          <span class="scene-opt-icon">👉</span>
        </button>
      </div>
    `;

    document.getElementById('mbti-nav').style.display = idx > 0 ? 'block' : 'none';
  },

  selectMbtiAnswer(qid, score) {
    this.state.mbtiAnswers[qid] = score;

    const idx = this.state.mbtiCurrentIdx;
    if (idx < MBTI_QUESTIONNAIRE.length - 1) {
      this.state.mbtiCurrentIdx++;
      this.renderMbtiQuestion();
    } else {
      this.finishMbtiTest();
    }
  },

  prevQuestion(type) {
    if (type === 'mbti' && this.state.mbtiCurrentIdx > 0) {
      this.state.mbtiCurrentIdx--;
      this.renderMbtiQuestion();
    }
  },

  finishMbtiTest() {
    this.state.mindResult = MBTIScorer.calculate(this.state.mbtiAnswers);
    this.showScreen('loading');
    setTimeout(() => {
      this.renderResult();
      this.showScreen('result');
    }, 1800);
  },

  // ===== 结果页渲染 =====
  renderResult() {
    const mind = this.state.mindResult;
    if (!mind) return;

    const skipped = this.state.bodySkipped;
    const personalityReport = ReportProvider.getBodyReport(mind.mindType);
    const mindReport = ReportProvider.getMindReport(mind.mindType);

    // 身体卡片
    const bodyCard = document.getElementById('result-body-card');
    const connector = document.querySelector('.type-connector');
    const fusionBox = document.querySelector('.fusion-box');
    const bodySectionTitle = document.querySelector('.section-title');
    const bodyDimsContainer = document.getElementById('body-dimensions-container');
    const btnAI = document.getElementById('btn-ai');

    if (skipped) {
      if (bodyCard) bodyCard.style.display = 'none';
      if (connector) connector.style.display = 'none';
      if (fusionBox) fusionBox.style.display = 'none';
      if (bodySectionTitle) bodySectionTitle.style.display = 'none';
      if (bodyDimsContainer) bodyDimsContainer.style.display = 'none';
      if (btnAI) btnAI.style.display = 'none';
      const mbtiCard = document.getElementById('result-mbti-card');
      if (mbtiCard) { mbtiCard.style.flex = '1'; mbtiCard.style.maxWidth = '100%'; }
    } else {
      if (bodyCard) bodyCard.style.display = '';
      if (connector) connector.style.display = '';
      if (fusionBox) fusionBox.style.display = '';
      if (bodySectionTitle) bodySectionTitle.style.display = '';
      if (bodyDimsContainer) bodyDimsContainer.style.display = '';
      if (btnAI) btnAI.style.display = '';

      const body = this.state.bodyResult;
      const bodyReport = ReportProvider.getBodyReport(body.bodyType);

      document.getElementById('result-body-emoji').textContent = bodyReport?.emoji || '🫀';
      document.getElementById('result-body-name').textContent =
        `${body.bodyType} · ${bodyReport?.tag || ''}`;
      document.getElementById('result-body-tagline').textContent =
        bodyReport?.phrase || '';

      document.getElementById('result-fusion').innerHTML =
        this.buildCardHTML(body, mind, bodyReport, personalityReport, mindReport);

      this.renderBodyDimensions(body, bodyReport);
    }

    // 性格卡片
    document.getElementById('result-mbti-emoji').textContent = personalityReport?.emoji || '🧠';
    document.getElementById('result-mbti-name').textContent =
      `${mind.mindType} · ${personalityReport?.tag || mind.mindType}`;
    document.getElementById('result-mbti-tagline').textContent =
      personalityReport?.phrase || '';

    // 性格维度条
    for (const dim of ['EI', 'SN', 'TF', 'JP']) {
      const bar = document.getElementById('bar-' + dim.toLowerCase());
      const val = document.getElementById('val-' + dim.toLowerCase());
      if (bar && val && mind.dimensions[dim]) {
        bar.style.width = mind.dimensions[dim].percent + '%';
        val.textContent = mind.dimensions[dim].value + ' ' + mind.dimensions[dim].percent + '%';
      }
    }

    // 性格卡牌分析
    this.renderMindCard(mind, mindReport);
  },

  // ===== 卡牌式融合解读 =====
  buildCardHTML(body, mind, bodyReport, persReport, mindReport) {
    const bTag = bodyReport?.tag || body.bodyType;
    const pTag = persReport?.tag || mind.mindType;

    // 摘取最核心的一句
    const bodyLine = bodyReport?.bodyReading
      ? bodyReport.bodyReading.split('\n\n')[0].replace(/\n/g, '').slice(0, 80) + '…'
      : '';
    const persLine = mindReport?.analysis
      ? mindReport.analysis.split('\n\n')[0].replace(/\n/g, '').slice(0, 80) + '…'
      : '';

    return `
      <div class="card-fusion">
        <div class="card-tag-row">
          <span class="card-tag body-tag">${bTag}</span>
          <span class="card-tag-x">×</span>
          <span class="card-tag mind-tag">${pTag}</span>
        </div>
        <div class="card-line body-line">🫀 ${bodyLine}</div>
        <div class="card-line mind-line">🧠 ${persLine}</div>
      </div>
    `;
  },

  // ===== 性格卡牌 =====
  renderMindCard(mind, mindReport) {
    const container = document.getElementById('mind-analysis-container');
    if (!container || !mindReport) { if (container) container.style.display = 'none'; return; }
    container.style.display = '';

    container.innerHTML = `
      <div class="persona-card">
        <div class="persona-header">
          <span class="persona-emoji">${mindReport.emoji || ''}</span>
          <div>
            <div class="persona-name">${mindReport.tag}</div>
            <div class="persona-phrase">${mindReport.phrase || ''}</div>
          </div>
        </div>
        <div class="persona-body">
          <div class="persona-text">${this.formatReading(mindReport.analysis)}</div>
          <div class="persona-stats">
            <div class="stat"><span class="stat-label">优势</span><span class="stat-val">${mindReport.strengths}</span></div>
            <div class="stat"><span class="stat-label">盲点</span><span class="stat-val">${mindReport.blindspots}</span></div>
          </div>
          ${mindReport.advice ? `
          <div class="persona-text">${this.formatReading(mindReport.advice)}</div>` : ''}
        </div>
      </div>
    `;
  },

  // ===== 身体维度（仅完整模式） =====
  renderBodyDimensions(body, report) {
    const container = document.getElementById('body-dimensions-container');
    if (!container || this.state.bodySkipped) return;

    const dimLabels = {
      EI: { label: 'E 免疫反应强度', high: '外向免疫', low: '内向免疫' },
      SN: { label: 'N 波动指数', high: '高波动型', low: '稳态型' },
      TF: { label: 'T 机制化控制', high: '控制型', low: '适应型' },
      JP: { label: 'P 多路径适应', high: '多路径型', low: '专一型' },
    };
    const bodyDimKeyMap = { EI: 'E', SN: 'N', TF: 'T', JP: 'P' };

    let html = '';
    for (const [key, dim] of Object.entries(body.dimensions)) {
      const info = dimLabels[key];
      const bodyKey = bodyDimKeyMap[key] || key.slice(0, 1);
      const reportDim = report?.dimensions?.[bodyKey];
      const level = reportDim?.level || (dim.score >= 0 ? '偏高' : '偏低');
      const desc = reportDim?.desc || '';
      html += `
        <div class="body-dim-item">
          <div class="body-dim-header">
            <span class="body-dim-label">${info.label}</span>
            <span class="body-dim-level">${level}</span>
          </div>
          <div class="body-dim-bar-wrap">
            <div class="body-dim-bar"><div class="body-dim-fill" style="width:${dim.percent}%"></div></div>
            <span class="body-dim-pct">${dim.percent}%</span>
          </div>
          <p class="body-dim-desc">${desc}</p>
        </div>`;
    }
    container.innerHTML = html;
  },

  formatReading(text) {
    if (!text) return '<p>暂无数据</p>';
    return text.split('\n\n').filter(p => p.trim())
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  },

  // ===== AI 深度解读 =====
  async requestAIReading() {
    const body = this.state.bodyResult;
    const mind = this.state.mindResult;
    if (!body || !mind) return;

    const bodyReport = ReportProvider.getBodyReport(body.bodyType);
    const personalityReport = ReportProvider.getBodyReport(mind.mindType);
    const btn = document.getElementById('btn-ai');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ 正在生成…'; }

    try {
      const res = await fetch(API_CONFIG.baseURL + '/ai-cross-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyType: body.bodyType, mindType: mind.mindType,
          bodyReport: JSON.stringify(bodyReport),
          mindReport: JSON.stringify(personalityReport),
          bloodSummary: JSON.stringify(body.raw || {}),
        }),
      });
      const data = await res.json();
      this.state.aiText = data.text;
      this.renderAIResult();
    } catch (err) {
      this.toast('AI 服务暂时不可用，请稍后重试');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '🤖 AI 深度解读'; }
    }
  },

  renderAIResult() {
    const el = document.getElementById('ai-result-area');
    if (!el || !this.state.aiText) return;
    el.innerHTML = `<div class="ai-content">${this.simpleMarkdown(this.state.aiText)}</div>`;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth' });
  },

  simpleMarkdown(text) {
    return text
      .replace(/### (.*)/g, '<h4>$1</h4>')
      .replace(/## (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, (m) => m.startsWith('<') ? m : `<p>${m}</p>`);
  },

  // ===== 分享 =====
  shareResult() {
    const body = this.state.bodyResult;
    const mind = this.state.mindResult;
    if (!mind) return;

    const bTag = body ? (ReportProvider.getBodyReport(body.bodyType)?.tag || '') : '';
    const pTag = ReportProvider.getBodyReport(mind.mindType)?.tag || '';

    let text = `🧬 我的双重MBTI自测结果：\n`;
    if (body) text += `身体：${body.bodyType}「${bTag}」\n`;
    text += `性格：${mind.mindType}「${pTag}」\n\n来测测你的 →`;

    if (navigator.share) {
      navigator.share({ title: '身体性格双重MBTI', text });
    } else {
      navigator.clipboard.writeText(text).then(() => this.toast('已复制分享文案 📋'));
    }
  },

  restart() {
    this.state = {
      screen: 'welcome', bodyFeelAnswers: {}, bodyFeelIdx: 0,
      bodyResult: null, bodySkipped: false,
      mbtiAnswers: {}, mbtiCurrentIdx: 0,
      mindResult: null, aiText: null,
    };
    this.showScreen('welcome');
  },

  toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  },
};

document.addEventListener('DOMContentLoaded', () => app.init());
