---
title: Git学习笔记
publish: true
description: 浅学Git笔记
date: 2024-09-15 10:48:00
#tag: Git
sticky: 2
---

# Git基础

> 推荐两个学习Git的网站<br>
> [Git在线练习](https://learngitbranching.js.org/?locale=zh_CN)<br>
> [Git科普视频](https://www.bilibili.com/video/BV1HM411377j/?spm_id_from=333.337.search-card.all.click&vd_source=a15269894d9b8114cb5f9bb663d22be9)<br>
> “惟手熟尔”

## 最小配置

- 配置user信息

  - 配置user.name:`git config --global user.name 'lyydsheep'`

  - 配置user.email:`git config --global user.email '2230561977@qq.com'`

  - ```Go
    //显示不同级别的配置信息
    git config --list --local
    git config --list --global
    git config --list --system
    ```
