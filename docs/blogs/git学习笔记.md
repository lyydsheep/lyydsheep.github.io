---
title: Git学习笔记
publish: false
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

## 新建仓库

在git中有两种新建仓库的方式

- `git init`：在本地新建一个仓库
- `git clone url`：从远程服务器上克隆一个仓库

## 工作区和缓存区

![image-20240915102716820](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151027874.png)

## 添加和提交文件

- `git status`：查看仓库状态
- `git add`：添加到暂存区
    - 可以使用通配符：`git add *.txt`
    - 也可以使用目录：`git add .`
- `git commit`：只提交**暂存区**中的内容，不会提交**工作区**的内容
- `git log`：查看仓库历史提交记录
    - `git log --oneline`：简洁地呈现日志

