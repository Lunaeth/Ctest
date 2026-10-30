"""Import supplied AI PDFs; keep illustrated PBQs separate from scored questions."""
import argparse
import hashlib
import html
import json
import re
from pathlib import Path
import pymupdf

HEADER = re.compile(r'(?m)^\s*(?:Question #:(\d+) - \[([^\]]+)\]|QUESTION (\d+))\s*$')
OPTION = re.compile(r'(?m)^\s*([A-H])\.\s+')

def clean(text):
    text = re.sub(r'[^\x00-\x7f]+IT[^\x00-\x7f]+', ' ', text)
    text = re.sub(r'店铺：IT认证考试服务', '', text)
    text = re.sub(r'[^\s]*IT[^\s]*服务', '', text)
    text = re.sub(r'54043FF735CC37177B5E4FEBD0383508', '', text)
    text = re.sub(r'(?m)^\s*(?:Cisco - 300-640|\d+ of \d+|=+)\s*$', '', text)
    text = text.replace('��s', "'s").replace('��', '—')
    text = re.sub(r'Correct\s*Answer:', '\nCorrect Answer:', text)
    text = re.sub(r'QUESTION\s*(\d+)', r'\nQUESTION \1', text)
    return text

def compact(text):
    return re.sub(r'\s+', ' ', clean(text)).strip()

def extract(pdf, bank, root):
    doc = pymupdf.open(pdf)
    pages = [clean(p.get_text(sort=True)) for p in doc]
    full = '\n'.join(pages)
    headers = list(HEADER.finditer(full))
    images = {}
    current = None
    phase = 'question'
    # Order image and text blocks by vertical position, ignoring the repeated watermark image.
    for page in doc:
        for b in sorted(page.get_text('dict')['blocks'], key=lambda b: (b['bbox'][1], b['bbox'][0])):
            if b['type'] == 0:
                t = '\n'.join(''.join(s['text'] for s in l['spans']) for l in b['lines'])
                for line in t.splitlines():
                    m = HEADER.match(line)
                    if m:
                        current = int(m[1] or m[3]); phase = 'question'
                    if re.match(r'^\s*(?:Correct )?Answer:', line): phase = 'answer'
            elif current and b['type'] == 1:
                # Background watermark spans nearly the entire page.
                if b['bbox'][3] - b['bbox'][1] > page.rect.height * .65: continue
                if b['bbox'][1] > page.rect.height * .93: continue
                if b['width'] < 60 and b['height'] < 60: continue
                asset_dir = root / 'data' / 'ai-assets'; asset_dir.mkdir(exist_ok=True)
                name = f'{bank}-{current}-{phase}-{len(images.get(current, [])) + 1}.{b["ext"]}'
                (asset_dir / name).write_bytes(b['image'])
                images.setdefault(current, []).append({'src': './data/ai-assets/' + name, 'phase': phase})
    questions, reviews = [], []
    for i,m in enumerate(headers):
        qid = int(m[1] or m[3]); topic = m[2] or 'AI Infrastructure and Operations'
        block = full[m.end(): headers[i+1].start() if i+1<len(headers) else len(full)]
        a = re.search(r'(?m)^\s*(?:Correct )?Answer:\s*([A-H](?:[ ,]*[A-H])*)?\s*$', block)
        if not a: raise ValueError(f'{bank} {qid}: missing answer boundary')
        body = block[:a.start()]
        # Some PDF text runs put the first choice on the same line as the stem.
        body = re.sub(r'(?<=[?.])\s*([A-H]\.\s)', r'\n\1', body)
        opts = list(OPTION.finditer(body))
        explanation = block[a.end():]
        explanation = re.sub(r'(?m)^\s*(?:Section:.*|Explanation/Reference:.*|Explanation)\s*$', '', explanation)
        explanation = re.sub(r'^\s*Explanation:\s*', '', explanation)
        explanation = compact(explanation) or 'PDF 未提供文字解析，请结合答案与图示复习。'
        source_page = next(j+1 for j,p in enumerate(pages) if re.search(rf'(?:Question #:{qid} -|QUESTION {qid}\s*$)',p,re.M))
        q = {'id':qid,'topic':topic,'stem':compact(body[:opts[0].start()] if opts else body),
             'explanation':explanation,'source':{'file':pdf.name,'page':source_page},'answerSource':'provided-pdf',
             'images':[x['src'] for x in images.get(qid,[]) if x['phase']=='question']}
        if not opts:
            q.update(type='review', answerImages=[x['src'] for x in images.get(qid,[]) if x['phase']=='answer'])
            reviews.append(q); continue
        q['options']=[{'key':o[1],'text':compact(body[o.end():opts[j+1].start() if j+1<len(opts) else len(body)])} for j,o in enumerate(opts)]
        q['answer']=re.findall('[A-H]',a[1] or '')
        assert q['answer'] and set(q['answer']) <= {o['key'] for o in q['options']}, (bank,qid)
        assert all(o['text'] for o in q['options']), (bank,qid)
        q['type']='single' if len(q['answer'])==1 else 'multiple'
        q['analysis']={'source':bank,'outline':[f'PDF source: {pdf.name}, page {source_page}. Answers are supplied by the PDF, not independently verified.'],'whyChoose':explanation,'whyNotChoose':[]}
        q['learning']={'keyPointHtml':html.escape(explanation),'speedTipHtml':'按提供的 PDF 答案判分；解析为原文，未独立核验。', 'studyNotesHtml':[], 'studyTags':[topic],
          'options':[{'key':o['key'],'isCorrect':o['key'] in q['answer'],'explanation':('PDF 标注的正确选项。' if o['key'] in q['answer'] else 'PDF 未将此项列为答案。')+' 具体理由见上方原文解析。'} for o in q['options']]}
        questions.append(q)
    ids=sorted(q['id'] for q in questions+reviews)
    assert ids == list(range(1,len(headers)+1)), ids
    for suffix,data in [('',questions),('.review',reviews)]:
        (root/'data'/f'questions.{bank}{suffix}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    report={'bank':bank,'sourceSha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'pages':len(pages),'total':len(headers),'scored':len(questions),'reviewOnlyIds':[q['id'] for q in reviews], 'multiSelect':sum(q['type']=='multiple' for q in questions)}
    (root/'data'/f'{bank}-import-report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--ccnp',type=Path,required=True);parser.add_argument('--nca',type=Path,required=True)
    args=parser.parse_args();root=Path(__file__).resolve().parents[1]
    extract(args.ccnp,'ccnp-dcai',root);extract(args.nca,'nca-aiio',root)
