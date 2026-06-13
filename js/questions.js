/* ========================================
   趣旨自测 · 性格自测（20题，每维5题）
   每题是一个具体生活场景——你只需选最像你的反应
   ======================================== */

const MBTI_QUESTIONNAIRE = [
  // ==================== E 能量响应 ====================
  {
    id: 1, dim: 'EI',
    scene: '周五晚上，朋友临时拉你去一个全是陌生人的聚会。',
    question: '你的真实心理活动？',
    left:  '"谁都不认识……先去角落观察半小时再说"',
    right: '"太好了！新朋友！今晚我要认识所有人"',
  },
  {
    id: 2, dim: 'EI',
    scene: '你在咖啡馆加班，隔壁桌的人突然夸你的电脑贴纸很好看。',
    question: '你？',
    left:  '"谢谢……"（礼貌微笑然后继续低头，内心尴尬）',
    right: '"是吧！这个是在XX买的，我跟你说……"（十分钟后你们成了朋友）',
  },
  {
    id: 3, dim: 'EI',
    scene: '周末没有任何安排，完全由你支配。',
    question: '最让你舒服的一天是？',
    left:  '一个人待着——看书、打游戏、收拾房间，不说话最放松',
    right: '呼朋引伴——约饭、逛展、运动，一个人待着反而会无聊',
  },
  {
    id: 4, dim: 'EI',
    scene: '工作群/班级群里突然吵起来了，话题跟你有关。',
    question: '你的第一反应？',
    left:  '"先看看大家都说了什么……想清楚了再发言"',
    right: '"我来了！我的观点是——"（打字速度比思考速度快）',
  },
  {
    id: 5, dim: 'EI',
    scene: '刚到一个新的城市/公司/学校。',
    question: '你的适应方式？',
    left:  '先观察——这个环境的规则是什么？谁跟谁是什么关系？摸清楚了再动',
    right: '直接动——主动找人聊天、了解情况，在实践中摸清门道',
  },

  // ==================== N 稳定适应 ====================
  {
    id: 6, dim: 'SN',
    scene: '本来计划好周末去郊游，结果早上起床发现下暴雨。',
    question: '你的心情？',
    left:  '"没事，换个室内活动就行"——计划变了就变了，不纠结',
    right: '"啊……我期待了一周的……"——心情明显变差，需要时间调整',
  },
  {
    id: 7, dim: 'SN',
    scene: '换季。同事在打喷嚏，朋友圈在晒过敏。',
    question: '你的身体和情绪对换季的反应？',
    left:  '几乎无感——春夏秋冬对我都一样，情绪不跟天气走',
    right: '非常明显——烦躁、起疹、睡不好、情绪也跟着波动',
  },
  {
    id: 8, dim: 'SN',
    scene: '你刚得知一个好消息和一个坏消息，几乎同时。',
    question: '接下来一小时你的状态？',
    left:  '两个消息都消化了，情绪回到基线，该干嘛干嘛',
    right: '好消息让我兴奋、坏消息让我低落，两种情绪来回拉扯停不下来',
  },
  {
    id: 9, dim: 'SN',
    scene: '下午喝了一杯奶茶/咖啡。',
    question: '对你当晚睡眠的影响？',
    left:  '"完全没有影响，咖啡当水喝照样秒睡"',
    right: '"完了，今晚可能要凌晨三点才睡得着……"',
  },
  {
    id: 10, dim: 'SN',
    scene: '你花了很长时间做了一个方案，领导/老师说方向要改。',
    question: '你的内心？',
    left:  '"OK，改就改"——深呼吸一下就好了，不往心里去',
    right: '"但我已经做了这么多……"——需要一点时间消化这个落差',
  },

  // ==================== T 决策控制 ====================
  {
    id: 11, dim: 'TF',
    scene: '好朋友深夜打给你，哭诉和对象吵架了。',
    question: '你的回应方式？',
    left:  '"我们先理一下，事情的经过是怎样的？你觉得对方为什么那样说？"——帮她分析逻辑',
    right: '"天哪怎么这样！你也太委屈了吧呜呜呜"——先陪她一起哭，情绪接住了再说',
  },
  {
    id: 12, dim: 'TF',
    scene: '要买一台新手机/电脑。',
    question: '你的选购方式？',
    left:  '列表格——型号、参数、价格、评测对比，选性价比最高的那个',
    right: '"这个颜色好看，就它了"——参数不重要，我喜欢最重要',
  },
  {
    id: 13, dim: 'TF',
    scene: '你发现同事/同学的工作里有明显的错误。',
    question: '你？',
    left:  '"这个数据好像有问题，你看这里……"——直接指出来，就事论事',
    right: '"呃……那个……要不要再看一下？"——怕对方难堪，措辞想了半天',
  },
  {
    id: 14, dim: 'TF',
    scene: '你的旅行计划。',
    question: '你更接近哪种风格？',
    left:  '攻略精确到小时——几点出门、坐哪班车、去哪家餐厅，一切有计划',
    right: '大概知道哪天去哪就行了——到了再说，走错了也是一道风景',
  },
  {
    id: 15, dim: 'TF',
    scene: '你给自己订了一个目标（比如健身/学语言/存钱）。',
    question: '你的执行方式？',
    left:  '分解成每周每天的任务量，不打卡不舒服，漏了一天会补回来',
    right: '凭感觉来——这周状态好就多做点，状态不好就算了，随缘',
  },

  // ==================== P 策略模式 ====================
  {
    id: 16, dim: 'JP',
    scene: '遇到了一个棘手的问题（工作Bug/学业难题/人际矛盾）。',
    question: '你通常会？',
    left:  '锁定一个方法死磕到底——这个问题必须今天解决，不解决不睡觉',
    right: '同时想好几个思路——这个不行就换那个，如果一个卡住了先去试试别的',
  },
  {
    id: 17, dim: 'JP',
    scene: '你的微信收藏夹/浏览器标签页。',
    question: '它更接近？',
    left:  '"收藏了就分类整理，定期清理，每个标签页用完就关"',
    right: '"我有287个标签页和1735条收藏……但我知道我要找的东西在哪里"',
  },
  {
    id: 18, dim: 'JP',
    scene: '你决定学一样新东西（乐器/语言/编程）。',
    question: '三个月后？',
    left:  '还在学那一样东西——每天练，已经能看到进步了',
    right: '已经换了四种——Ukulele→吉他→日语→Python，每个都开了个头',
  },
  {
    id: 19, dim: 'JP',
    scene: '一个项目/作业的截止日是下周五。',
    question: '你的节奏？',
    left:  '这周就开始做，最迟周三完成——不喜欢被deadline追着跑',
    right: '周四晚上开始做——deadline前的高压让我效率拉满',
  },
  {
    id: 20, dim: 'JP',
    scene: '朋友说："你这个人做事的风格就是——"',
    question: '你希望ta接什么？',
    left:  '"认准了就一杆子捅到底，八头牛拉不回来"',
    right: '"什么都想试试，永远有B计划C计划D计划"',
  },
];

// ===== 计分工具 =====
const MBTIScorer = {
  calculate(answers) {
    const dimScores = { EI: 0, SN: 0, TF: 0, JP: 0 };
    const dimCounts  = { EI: 0, SN: 0, TF: 0, JP: 0 };

    for (const q of MBTI_QUESTIONNAIRE) {
      const score = answers[q.id] || 0;
      dimScores[q.dim] += score;
      dimCounts[q.dim]++;
    }

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
        label: MBTI_DIMS[dim][value === dimMap[dim].high ? 'highName' : 'lowName'],
      };
    }

    const mindType = dimensions.EI.value + dimensions.SN.value + dimensions.TF.value + dimensions.JP.value;

    return { mindType, dimensions, rawScores: dimScores };
  }
};
