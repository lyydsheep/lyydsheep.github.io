---
title: 待读清单
layout: page
permalink: /to-read/
comments: false
---

收集值得稍后精读的文章、书籍与资料。读完后将条目移入对应主题笔记。

## Agent 与基础设施

- [ ] [Designing the Backend for Agent Systems (Part 2)](https://x.com/kmeanskaran/status/2091091491280060426)
  - **作者**：Karan（@kmeanskaran）
  - **加入日期**：2026-08-24
  - **内容**：Agent 后端的 API、队列、worker、流式传输、结构化输出、session 与成本控制。
  - **阅读重点**：区分生产级必需的不变量与只在达到一定规模后才需要的架构。

- [ ] [LLM-as-a-Verifier](https://github.com/llm-as-a-verifier/llm-as-a-verifier)
  - **作者**：Jacky Kwok 等
  - **加入日期**：2026-08-25
  - **内容**：用细粒度 LLM 评分和概率枢轴锦标赛从多条 Agent 轨迹中选优。
  - **阅读重点**：评估 test-time scaling 的质量收益、verifier 成本和 prefix cache 优化。

- [ ] [How to Understand the Next Wave of AI Before Everyone Else](https://www.youtube.com/watch?v=4qjEgPojjzM)
  - **作者**：Matthew Berman、Tibo
  - **加入日期**：2026-08-25
  - **内容**：关于 Codex、个人 Agent、开发工作流、递归自我改进和超高速推理的访谈。
  - **阅读重点**：优先看 Agent、Codex 融合、递归改进与超高速推理章节。

- [ ] [Headlong: a microharness for persistent agents](https://www.laude.org/updates/headlong-a-microharness-for-persistent-agents)
  - **作者**：Laude Institute、MIT
  - **加入日期**：2026-08-25
  - **内容**：一个以 Bash、持续思考循环和 JSONL 轨迹 DAG 构建的 persistent-agent microharness。
  - **阅读重点**：理解持续 Agent 的记忆压缩、自我修改、沙箱、成本和多用户隔离问题。

- [ ] [从零“手搓”一个小型 LLM](https://km.woa.com/knowledge/10851/node/17)
  - **作者**：yongzheng、patrickguo
  - **加入日期**：2026-08-24
  - **内容**：从 Tokenizer、Embedding、Attention 到预训练、SFT 和采样，完整实现一个微型 LLM。
  - **阅读重点**：配合源码调试，建立 Transformer 和训练流程的工程直觉。

- [ ] [2025年下半年腾讯技术突破奖-XNet：微信终端 AI 计算引擎](https://km.woa.com/knowledge/10851/node/20)
  - **作者**：ziyangma
  - **加入日期**：2026-08-24
  - **内容**：跨平台终端 AI 引擎在芯片适配、算子性能、内存和包体优化上的实践。
  - **阅读重点**：学习软硬件协同优化、JIT 与跨平台计算抽象的取舍。

- [ ] [解密 CodeBuddy Agent 设计与上下文工程建设](https://km.woa.com/knowledge/10851/node/21)
  - **作者**：gamyhuang
  - **加入日期**：2026-08-24
  - **内容**：围绕“上下文 + 工具 + 循环”拆解生产级 Coding Agent 设计。
  - **阅读重点**：理解上下文完整性、成本与 Agent 可扩展性之间的权衡。

- [ ] [CodeBuddy+OpenSpec+Skills 我在100万行老项目中的AI编程实践](https://km.woa.com/knowledge/10851/node/22)
  - **加入日期**：2026-08-24
  - **内容**：KM MCP 当前无正文访问权限，标题来自年刊目录。
  - **阅读重点**：关注 OpenSpec 和 Skills 如何在百万行存量项目中约束 AI 编程。

- [ ] [一文读懂AI Coding市场现状与商业化策略](https://km.woa.com/knowledge/10851/node/25)
  - **作者**：kimxzhang
  - **加入日期**：2026-08-24
  - **内容**：从 ToB 视角梳理 AI Coding 的技术趋势、市场格局、产品指标和商业化策略。
  - **阅读重点**：评估编码补全、Agent 与软件工程平台的产品边界和差异化空间。

- [ ] [高敏感性业务微信支付怎么做 AI 工程进化](https://km.woa.com/knowledge/10851/node/47)
  - **作者**：anderszhou
  - **加入日期**：2026-08-24
  - **内容**：微信支付在 AI 开发、UAT、Harness Engineering、知识工程与组织协作上的实践。
  - **阅读重点**：理解确定性验证流程如何约束 Agent 的不确定性。

## 模型训练

- [ ] [Reinforcement Learning for LLMs](https://cameronrwolfe.substack.com/p/llm-rl)
  - **作者**：Cameron R. Wolfe
  - **加入日期**：2026-08-25
  - **内容**：从 RL 基础、policy gradient、REINFORCE 和 PPO 到 GRPO 变体与 Agentic RL 的系统教程。
  - **阅读重点**：理解 LLM 的 MDP/bandit 建模、reward/advantage 估计和 critic-free 算法的取舍。

## 后端工程

- [x] [后端开发术语大全](https://km.woa.com/articles/show/418578)
  - **作者**：willlv
  - **加入日期**：2026-08-24
  - **内容**：按系统开发、架构设计、网络通信、故障处理、监控告警、服务治理、测试与发布部署分类整理后端术语。
  - **阅读重点**：用作术语速查和团队技术语言对齐，重点对比容易混淆的概念。

- [ ] [理财通营销活动平台架构演进与思考实践](https://km.woa.com/knowledge/10851/node/34)
  - **作者**：alexjhwen
  - **加入日期**：2026-08-24
  - **内容**：从领域建模、插件化、资金风控和 ROI 度量梳理营销平台的架构演进。
  - **阅读重点**：关注架构复杂度如何随真实业务问题逐步增长，而非提前设计。

- [ ] [朋友圈搜索系统：万亿数据挑战下的检索技术](https://km.woa.com/knowledge/10851/node/10)
  - **作者**：kaelhua
  - **加入日期**：2026-08-24
  - **内容**：万亿级朋友圈数据在关系链约束下的段落索引、全磁盘检索和预求交优化。
  - **阅读重点**：学习索引建模如何同时降低 IOPS、CPU 和存储成本。

相关索引：知识库索引
