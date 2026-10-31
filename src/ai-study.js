// Explicit reviewed topics; these are study groups, not official exam weights.
const MODULES = [
  ['ai-foundations', 'AI foundations｜AI 基础', 'Training, inference, model types｜训练、推理与模型类型'],
  ['ai-lifecycle', 'Model lifecycle｜模型生命周期', 'Data, training, validation, deployment｜数据、训练、验证与部署'],
  ['accelerated-compute', 'Accelerated compute｜加速计算', 'GPU, memory, parallelism｜GPU、显存与并行计算'],
  ['ai-compute', 'Compute hardware｜计算硬件', 'UCS, GPU interconnects, server design｜UCS、GPU 互联与服务器设计'],
  ['ai-networking', 'AI networking｜AI 网络', 'RoCE, RDMA, QoS, topology｜RoCE、RDMA、QoS 与拓扑'],
  ['ai-storage', 'Data & storage｜数据与存储', 'Data paths, capacity, shared storage｜数据路径、容量与共享存储'],
  ['ai-software', 'AI software｜AI 软件', 'Frameworks, libraries, containers｜框架、库与容器'],
  ['ai-platform', 'Platforms & management｜平台与管理', 'Product roles, policies, orchestration｜产品职责、策略与编排'],
  ['ai-deployment', 'Deployment｜部署', 'Compatibility, provisioning, installation｜兼容性、资源配置与安装'],
  ['ai-operations', 'Operations & troubleshooting｜运维排错', 'Metrics, evidence, corrective actions｜指标、证据与修复措施'],
  ['power-cooling', 'Power & cooling｜供电散热', 'Power budgets, redundancy, thermal limits｜功率预算、冗余与热限制'],
].map(([id,label,description])=>({id,label,shortLabel:label.split('｜')[0],description}));

export const AI_BANKS = Object.freeze({
  ccnpDcai: {label:'CCNP-DCAI',file:'./data/questions.ccnp-dcai.json?v=20261031-sidebar-account',reviewFile:'./data/questions.ccnp-dcai.review.json?v=20261031-sidebar-account',
    modules:['ai-foundations','ai-compute','ai-networking','ai-storage','ai-platform','ai-deployment','ai-operations','power-cooling']},
  ncaAiio: {label:'NCA-AIIO',file:'./data/questions.nca-aiio.json?v=20261031-sidebar-account',
    modules:['ai-foundations','ai-lifecycle','accelerated-compute','ai-networking','ai-storage','ai-software','ai-platform','ai-deployment','ai-operations','power-cooling']},
});

export function getAiStudyModules(bankId) {
  return (AI_BANKS[bankId]?.modules ?? []).map(id=>({...MODULES.find(module=>module.id===id)}));
}

export function getAiStudyModule(question) {
  return getAiStudyModules(question?.aiStudy?.bankId).find(module=>module.id===question.aiStudy.module);
}

export function buildAiModuleStats(questions,bankId) {
  const bankQuestions=questions.filter(q=>q.aiStudy?.bankId===bankId && q.type!=='review');
  return [{id:'all',label:'All questions｜全部计分题',shortLabel:'All｜全部',description:'按原题编号学习 / Learn in source-ID order',count:bankQuestions.length},
    ...getAiStudyModules(bankId).map(module=>({...module,count:bankQuestions.filter(q=>q.aiStudy.module===module.id).length}))];
}

export function aiMapUrl(bankId,moduleId='all',questionId=null) {
  const params=new URLSearchParams({bank:AI_BANKS[bankId]?bankId:'ccnpDcai'});
  if(getAiStudyModules(bankId).some(m=>m.id===moduleId)) params.set('module',moduleId);
  return `./ai-map.html?${params}${questionId==null?'':`#question-${encodeURIComponent(questionId)}`}`;
}

export function aiStudyUrl(bankId,{moduleId='all',questionId=null,mode='learn'}={}) {
  const params=new URLSearchParams({studyBank:bankId,studyModule:moduleId,studyMode:mode});
  if(questionId!==null)params.set('studyQuestion',String(questionId));
  return `./index.html?${params}#/${mode==='practice'?'practice':'learn'}`;
}

export function readAiStudyRequest(search='') {
  const params=new URLSearchParams(search);
  const bankId=params.get('studyBank');
  if(!Object.hasOwn(AI_BANKS,bankId))return null;
  const moduleId=params.get('studyModule')||'all';
  if(moduleId!=='all'&&!getAiStudyModules(bankId).some(m=>m.id===moduleId))return null;
  const mode=params.get('studyMode')||'learn';
  if(!['learn','practice'].includes(mode))return null;
  const raw=params.get('studyQuestion');
  if(raw!==null&&!/^[1-9]\d*$/.test(raw))return null;
  const questionId=raw===null?null:Number(raw);
  if(questionId!==null&&!Number.isSafeInteger(questionId))return null;
  return {bankId,moduleId,mode,questionId};
}

export function resolveAiStudyRequest(request,questions) {
  if(!request)return null;
  const scoped=questions.filter(q=>q.aiStudy?.bankId===request.bankId && q.type!=='review'
    && (request.moduleId==='all'||q.aiStudy.module===request.moduleId));
  if(!scoped.length)return null;
  const index=request.questionId===null?0:scoped.findIndex(q=>q.id===request.questionId);
  return index<0?null:{...request,questions:scoped,index};
}

const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
export function filterAiStudyQuestions(questions,{bankId,moduleId='all',query=''}={}) {
  const tokens=normalize(query).split(' ').filter(Boolean);
  return questions.filter(q=>{
    if(q.aiStudy?.bankId!==bankId || (moduleId!=='all'&&q.aiStudy.module!==moduleId))return false;
    const study=q.aiStudy;
    // Never search the retained, superseded PDF answer or wording.
    const searchable=normalize([q.id,q.stem,study.stemZh,study.summary.en,study.summary.zh,
      study.memory.en,study.memory.zh,study.pitfall.en,study.pitfall.zh,
      ...study.terms.flatMap(t=>[t.en,t.zh]),...study.steps.flatMap(s=>[s.en,s.zh]),
      ...(q.options??[]).flatMap(o=>[o.text,o.translationZh]),
      ...Object.values(study.options).flatMap(o=>[o.en,o.zh,o.reason.en,o.reason.zh])].join(' '));
    return tokens.every(token=>searchable.includes(token));
  });
}

export function getRelatedAiQuestions(question,questions,limit=4) {
  const terms=new Set((question.aiStudy?.terms??[]).map(t=>normalize(t.en)));
  return questions.filter(q=>q.id!==question.id&&q.aiStudy?.bankId===question.aiStudy?.bankId)
    .map(q=>({question:q,score:(q.aiStudy.module===question.aiStudy.module?1:0)
      +q.aiStudy.terms.filter(t=>terms.has(normalize(t.en))).length*3}))
    .filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.question.id-b.question.id)
    .slice(0,limit).map(item=>item.question);
}

export function getAiPracticeGuide(question) {
  const module=getAiStudyModule(question);
  if(!module)return null;
  return {...module,visualUrl:aiMapUrl(question.aiStudy.bankId,module.id,question.id),
    flow:question.aiStudy.steps.map(step=>`${step.zh} / ${step.en}`)};
}

export function getAiDecision(question,feedback) {
  const guide=getAiPracticeGuide(question);
  if(!guide||!feedback)return null;
  const keys=new Set(Array.isArray(feedback.selectedAnswer)?feedback.selectedAnswer:[]);
  const missed=question.answer.filter(key=>!keys.has(key));
  const extra=[...keys].filter(key=>!question.answer.includes(key)&&question.aiStudy.options[key]);
  const reasons=extra.map(key=>`${key}: ${question.aiStudy.options[key].reason.zh} / ${question.aiStudy.options[key].reason.en}`);
  return {
    status:feedback.correct?'correct':'wrong',
    text:[question.aiStudy.summary.zh,question.aiStudy.summary.en,
      missed.length?`漏选 / Missing: ${missed.join(', ')}`:'',
      extra.length?`多选或误选 / Incorrect selections: ${extra.join(', ')}`:'',...reasons].filter(Boolean).join('\n'),
    visualUrl:guide.visualUrl,visualLabel:`知识图谱 / Map · ${guide.label}`,
    reviewQuery:question.aiStudy.terms.map(term=>`${term.en} / ${term.zh}`).join(' · '),
  };
}
