# 🧬 趣味自测 · 身体性格双重MBTI

**身体免疫MBTI × 心理性格MBTI = 你的身心密码**

基于血常规指标的免疫分型与28题MBTI性格测试，生成专属身心双重报告。接入DeepSeek AI实现个性化交叉解读。

---

## 🎮 核心玩法

| 步骤 | 内容 | 说明 |
|------|------|------|
| 1. 血常规输入 | 手动填入WBC、NEUT%、LYMPH%等8项指标 | 留空使用默认值，至少填2项 |
| 2. 身体波动评估 | 1-5级辅助问题 | 评估身体状态稳定性 |
| 3. 28题MBTI测试 | 7级量表，每题-3~+3 | 自动计算E/I、S/N、T/F、J/P |
| 4. 双重结果 | 身体类型+性格类型+融合解读 | 32份标准报告 |
| 5. AI深度解读 | DeepSeek生成800字个性化分析 | 可选 |

---

## 📊 16种身体免疫类型

基于血常规四维度(E/N/T/P)的z-score计算：

| 类型 | 趣味标签 | 特质关键词 |
|------|----------|-----------|
| ISTJ | 老不死预备役 | 冷启动、极稳定、超强修复 |
| ISTP | 延迟七日体 | 启动迟缓、七日周期、慢工细活 |
| ISFJ | 忍着神龟 | 痛觉迟钝、忍耐力强、稳态压制 |
| ISFP | 天气通灵体 | 环境敏感、气候依赖、免疫混杂 |
| INTJ | 冬眠体质 | 低功耗、极平稳、精准调节 |
| INTP | 复盘大师 | 记忆回溯、过度分析、免疫混乱 |
| INFJ | 八龙衔珠地动仪 | 全息预警、小题大做、交叉验证 |
| INFP | 心想事成偏科版 | 情绪驱动、自我实现发烧、偏科 |
| ESTJ | 怕痛全点防御 | 快速启动、速战速决、流程化 |
| ESTP | 3秒结束战斗 | 极速反应、暴力碾压、闪电战 |
| ESFJ | 配合你演出 | 群体同步、读空气、模仿免疫 |
| ESFP | 多巴胺飞轮 | 情绪过山车、两极摆荡、混乱 |
| ENFJ | 窘迫代理人 | 共情免疫、替人防御、过度代偿 |
| ENFP | 情绪百吨王 | 全有或全无、情绪百吨、缺乏中间带 |
| ENTJ | 旧日不再重现 | 免疫重生、格式化重启、灵活切换 |
| ENTP | 蒙古帝国体质 | 外战无敌、内耗炎症、策略冲突 |

---

## 🏗️ 技术架构

```
前端 (Vercel)          后端 (Railway)          AI (DeepSeek)
┌──────────┐         ┌──────────┐           ┌──────────┐
│ 静态HTML │  HTTP   │ Express  │  API Key  │ DeepSeek │
│ + CSS    │ ──────→ │ + 计算   │ ────────→ │ Chat API │
│ + JS SPA │         │ 引擎     │           │          │
└──────────┘         └──────────┘           └──────────┘
```

- **前端**：纯HTML/CSS/JS单页应用，部署于Vercel
- **后端**：Node.js + Express，部署于Railway
- **AI**：DeepSeek API（`deepseek-chat`模型）
- **离线降级**：无API Key时自动使用静态融合文本

---

## 🚀 部署指南

### 方案D: Vercel + Railway

#### 1. 准备
```bash
git init
git add .
git commit -m "init: 身体性格双重MBTI"
# 推送到GitHub仓库
```

#### 2. 前端 → Vercel
- 在 [vercel.com](https://vercel.com) 导入GitHub仓库
- 无需构建命令（纯静态文件）
- 设置环境变量：无需（前端无密钥）
- 部署后获得域名如 `xxx.vercel.app`

#### 3. 后端 → Railway
- 在 [railway.app](https://railway.app) 导入同一仓库
- Railway自动检测 `railway.toml`
- 设置环境变量：
  ```
  DEEPSEEK_API_KEY=sk-your-key
  NODE_ENV=production
  PORT=3001
  ```
- 部署后获得域名如 `xxx.up.railway.app`

#### 4. 连接前后端
- 更新 `vercel.json` 中的 `destination` 为Railway实际域名
- 或在前端 `js/config.js` 中设置 `baseURL`

#### 5. 本地开发
```bash
cd server
npm install
npm run dev
# 打开浏览器访问 http://localhost:3001
```

---

## 📁 项目结构

```
fun-body-mbti/
├── index.html          # 主入口SPA
├── css/
│   └── style.css       # 完整样式（深色主题+渐变动效）
├── js/
│   ├── config.js       # 常模数据与全局配置
│   ├── body-engine.js  # 血常规z-score计算引擎
│   ├── questions.js    # 28题MBTI问卷+计分器
│   ├── reports.js      # 32份标准报告模板
│   └── app.js          # 前端主逻辑
├── server/
│   ├── index.js        # Express后端+AI集成
│   └── package.json    # 后端依赖
├── vercel.json         # Vercel部署配置
├── railway.toml        # Railway部署配置
├── .env.example        # 环境变量模板
├── .gitignore
└── README.md
```

---

## 🔑 环境变量

| 变量 | 必须 | 说明 |
|------|------|------|
| `DEEPSEEK_API_KEY` | 否* | DeepSeek API密钥 |
| `PORT` | 否 | 服务端口，默认3001 |

*未配置AI密钥时，自动降级为静态融合解读。

---

## 📝 计算模型

详见 `js/body-engine.js`：
- **E = 0.4×zWBC + 0.4×zNEUT + 0.2×zCRP**
- **N = 0.5×内部离散度 + 0.5×辅助问卷z值**
- **T = 0.4×zLYMPH + 0.3×(-|zHGB|) + 0.3×zPLT**
- **P = (LYMPH%+MONO%+EOS%)/WBC 的z-score**

维度得分≥0取高维(E/N/T/P)，<0取低维(I/S/F/J)，组合为4字母身体类型码。

---

## ⚠️ 免责声明

本项目为趣味自测工具，不构成医疗建议。所有身体类型解读仅供娱乐和科普参考。如有健康疑虑，请咨询专业医生。
