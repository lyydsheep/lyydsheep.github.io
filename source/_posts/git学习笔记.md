---
title: Git学习笔记
publish: true
description: 浅学Git笔记
date: 2024-09-15 10:48:00
tag: Git
sticky: 2
---

# Git基础

> 推荐两个学习Git的网站
>
> [Git在线练习](https://learngitbranching.js.org/?locale=zh_CN)
>
> [Git科普视频](https://www.bilibili.com/video/BV1HM411377j/?spm_id_from=333.337.search-card.all.click&vd_source=a15269894d9b8114cb5f9bb663d22be9)
>
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

## git reset回退版本

使用`git reset`命令可以回退到指定的提交版本，`git reset`有三种模式

- `git reset --soft xxx`：回退到xxx版本，且保存xxx版本之后的工作区和暂存区的修改
- `git reset --hard xxx`：回退到xxx版本，并删除xxx版本之后工作区和暂存区的修改
- `git reset --mixed xxx`：回退到xxx版本，只保留xxx版本之后工作区的修改

![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151025720.png)

## 使用git diff查看差异

- `git diff`命令可以对两个东西进行比较，用于查看差异
  - 可以是工作区、暂存区、本地仓库之间的差异
  - 可以是不同版本之间的差异
  - 也可以是不同分支之间的差异

![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151024958.png)

- `git diff`：默认查**看工作区**和**暂存区**之间的差异
- `git diff HEAD`：查看**工作区、暂存区**和**本地仓库**的差异
- `git diff cached`：查看**暂存区**和**本地仓库**之间的差异
- `git diff <commit_hash> <commit_hash>`或者`git diff HEAD~ HEAD`：查看**不同提交**之间的差异
- `git diff <branch_name> <branch_name>`：比较**不同分支**之间的差异

![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151025464.png)

## 使用git rm删除文件

- `git rm <file_name>`：**一次性将文件从工作区和暂存区中删除**

![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151025557.png)

## .gitignore忽略文件

在.gitignore文件中写入匹配符，git会忽略对被匹配上的文件的管理

## SSH配置和克隆仓库

[如何在同一电脑上生成配置多个ssh key 公钥 私钥（保姆级教程）](https://juejin.cn/post/7085718883079815176)

- 在`.ssh`文件夹下，使用`ssh-keygen -t rsa -b 4096`生成私钥文件和公钥文件
  - 将公钥文件的信息配置到GitHub上
  - 保存好私钥文件中的信息
- `git clone repo-address`：克隆一个远程仓库
- `git push <remote> <branch>`：推送更新内容
- `git pull <remote>`：拉取更新内容

## 关联本地仓库和远程仓库

- 添加远程仓库
  - `git remote add 远程仓库名 远程仓库地址`
  - `git push -u 远程仓库名 远程仓库分支`
- 查看远程仓库
  - `git remote -v`
- 拉取远程仓库内容
  - `git pull 远程仓库名 远程仓库分支:本地仓库分支`

## 分支基本操作

- 查看分支列表：`git branch`
- 创建分支：`git branch <name>`
- 切换分支：`git switch <name>`
- 合并分支：`git merge <name>`，将`<name>`分支合并到当前的分支
- 删除分支：
  - `git branch -d <name>`：删除已合并的分支
  - `git branch -D <name>`：强制删除分支



## rebase和merge

- `git rebase`：
  - 优点：不会新增额外的提交记录，形成线性历史，比较直观和干净
  - 缺点：会改变提交历史，改变了当前分支branch out节点，避免在共享分支使用
  - 例如当前在main分支下：
    - `git rebase dev`：将main分支的修改嫁接到dev分支后面
    - ![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151025165.png)
- `git merge`：
  - 优点：不会破坏原分支的提交记录，方便回溯和查看
  - 缺点：会产生额外的提交节点，分支图比较复杂
  - 例如当前在main分支下：
    - `gie merge dev`：合并dev分支的修改

# Git和GitHub操作指南

## 初始化仓库并简单配置

> 对仓库进行初始化

- 使用`git init`完成对仓库的初始化操作

> 对仓库进行简单配置

- 使用`git config --global user.name "lyydsheep"`设置仓库的用户名
- 同样地，可以为仓库配置邮箱`git config --global user.email "2230561977@qq.com"`
  - 通过命令`git config --global --list `就可以**查看**我们为该仓库进行的配置

关于`system`、 `global`、`local`

- system-系统级: 在git安装以后，git的默认配置项都在这里
- global-全局级：登录用户全局级别的git配置
- local -仓库级: 对不同的仓库进行自定义配置

三个关键字所能配置的**属性集合是一样的，**不同在于**优先级**

```
local > global > system
```

> 为仓库创建一个分支

- 使用`git branch -M main`就能为仓库创建一个main分支

## 最简单的Git工作流程：工作区、暂存区、仓库

**相关命令**

- Git status：用于查看当前仓库的状态
- Git add filename:将filename文件添加至暂存区
  - 单个添加太慢了，不如使用`Git add .`将**所有**修改过的文件添加至暂存区
- Git commit -m "comment":将暂存区的文件提交至仓库中
  - -m "comment":是为这次提交进行注释
- Git log:查看历史提交记录

> 命令与文件状态变化过程

![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151024558.png)

## 将本地仓库同步到远程GitHub仓库

为什么选择`SSH`协议而不是`HTTPS`协议？

- 使用`HTTPS`协议可能在日后使用过程中需要**多次**输入用户名和密码，较麻烦
- `SSH`协议**仅需第一次**配置好公私钥，今后就无需再输入用户名和密码

具体步骤：

1. 为本地仓库创建一个远程的GitHub仓库 
   - 在GitHub网页上new一个仓库
   - 通过`git remote add origin ``git@github.com``:lyydsheep/learn_gogogogo.git`命令可以将本地仓库和远程仓库进行关联
   -  使用`git remote`可以查看远程仓库的名称
2. 配置公私钥，获取`push`远程仓库的权限
   -  使用`ssh-keygen -t rsa -C "2230561977@qq.com"`命令生成公私钥 
   - 将公钥的具体内容复制到`ssh and GPG keys`模块中
     - `Settings` -> `ssh and GPG keys` -> `New SSH key`

![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151024035.png)

![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151024012.png)

1. 使用`git push -u origin main`命令将本地文件推送至远程仓库
     - 前提是**本地仓库要有**`main`**分支**


![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151024373.png)

[在Goland中使用Git进行协作开发的流程 | 青训营笔记 - 掘金](https://juejin.cn/post/7196266492269199419)

**go** mod init 应用名称 就是在应用名称的根目录下，生成一个**go**.mod文件。

![img](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151024647.png)