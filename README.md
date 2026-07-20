# Ctest

一个纯前端的刷题系统，支持 CompTIA A+ Core 1/Core 2、Security+ SY0-701 等题库，以及练习、学习、模拟考试、错题本和本地学习存档。

## 功能

- 多题库切换，各题库独立保存进度、收藏、错题和考试记录
- 练习模式：即时判题、自动记录错题
- 学习模式：模块筛选、逐项解释、高频知识点、收藏和题号跳转
- Security+：按五个中英双语 SY0-701 考试领域学习；以社区 Most Voted 为判题答案，并把高赞讨论、题干限制、易混选项和同题库关联题整合为 Core 风格解析
- 模拟考试：交卷后查看成绩和错题
- 错题本：集中复习、移除已掌握题目
- 本地学习存档：可创建 `question-archive.json`，之后自动同步完整学习状态

## 技术栈

- 原生 HTML / CSS / JavaScript
- Python + `pypdf` 用于从 PDF 提取题库数据
- Node 内置测试运行器 + Python `unittest`

## 本地启动

```bash
npm run serve
```

然后打开：

```text
http://127.0.0.1:4173
```

## 测试

```bash
npm test
python -m unittest discover -s tests/python -p "test_*.py"
```

## 题库数据

项目当前包含以下题库数据：

- `data/questions.zh.json`
- `data/questions.en.json`
- `data/questions.core2.json`
- `data/questions.security-plus.json`
- `data/questions.aws-saa.json`

重新生成 Security+ 题库：

```bash
python scripts/extract_security_plus.py \
  --input /path/to/sy0-701.pdf \
  --output data/questions.security-plus.json \
  --report security-plus-extraction-report.json
```

Security+ 导入器优先采用社区投票第一名，其次采用 `Most Voted` 标记，最后才回退到 PDF 原始答案。依赖拖拽、热点图或交互式配置的 PBQ 不会伪装成普通选择题。

原始 PDF 不包含在仓库中。

## 学习记录


如果你在页面里创建了学习存档文件：

- 默认文件名为 `question-archive.json`
- 该文件也不会被提交到仓库


