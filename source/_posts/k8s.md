---
date: 2025-09-21
title: k8s
---

## 知识图谱
### 介绍说明
+ k8s 组件说明
    - k8s 组件
    - k8s 结构
        * 网络结构
        * 组件结构
+ k8s 中的一些关键字



### 基础概念
+ Pod 概念
    - 自主式 Pod
    - 管理器管理的 Pod
        * RS、RC
        * deployment
        * HPA
        * StatefulSet
        * DaemonSet
        * Job、CronJob
    - 服务发现
    - Pod 协同
+ 网络通讯
    - 网络通讯模式说明
    - 组件通讯模式说明



### 资源清单
+ k8s 中资源的概念
    - 什么是资源
    - 名称空间级别的资源
    - 集群级别的资源
+ 资源清单
    - yaml 语法格式
+ 通过资源清单编写 Pod
+ Pod 的生命周期
    - Init C
    - Pod phase
    - 容器探针
        * Liveness Probe
        * Readiness Probe
    - Pod hook
    - 重启策略



### Pod 控制器
+ Pod 控制器说明
    - 什么是控制器
    - 控制器类型说明
        * Replication Controller和 ReplicaSet
        * Deployment
        * DaemonSet
        * Job
        * CronJob
        * StatefulSet
        * Horizontal Pod Autoscalling

### 服务发现
+ Service 原理
    - Service 含义
    - Service 常见分类
        * ClusterIP
        * NodePort
        * ExternalName
    - Service 实现方式
        * userspace
        * iptables
        * ipvs
+ ingress
    - Nginx
        * HTTP 代理访问
        * HTTPS 代理访问
        * 使用 cookie 实现会话关联
        * BasicAuth
        * Nginx 进行重写
+

### 存储
+ configMap
    - 定义概念
    - 创建 configMap
        * 使用目录创建
        * 使用文件创建
        * 使用字面值创建
    - Pod 中使用 configMap
        * configMap 代替环境变量
        * configMap 设置命令行参数
        * 通过数据卷插件使用 configMap
    - configMap 热更新
        * 实现演示
        * 更新触发说明
+ Secret
    - 定义概念
        * 概念说明
        * 分类
    - Service Account
    - Opaque Secret
        * 特殊说明
        * 创建
        * 使用
            + Secret 挂载到 Volume
            + Secret 导出到环境变量
    - kubernetes.io/dockerconfigjson
+ volume
    - 定义概念
        * 卷的类型
    - emptyDir
    - hostPath
+ PV
    - 概念解释
        * PV
        * PVC
        * 类型说明
    - PV
        * 后端类型
        * PV 访问模式说明
        * 状态
    - PVC

### 调度器
+ 调度器概念
    - 概念
    - 调度过程
    - 自定义调度器
+ 调度亲和性
    - nodeAffinity
    - podAffinity
    - 亲和性运算符
+ 污点
    - 概念
    - Taint
    - Tolerations
+ 固定节点调度
    - podName 制定调度
    - 标签选择器

### 集群安全机制
+ 机制说明
+ 认证
    - HTTP Token
    - HTTP Base
    - HTTPS
+ 鉴权
    - alwaysDeny
    - alwaysAllow
    - ABAC
    - Webhook
    - RBAC
        * rbac
        * role and clusterRole
        * rolebinding and clusterrolebinding
        * resources
        * to subjects
+ 准入控制

### HELM
+ 概念
    - 说明
    - 组件构成
    - HELM 部署
    - HELM 自定义



### 运维
+ kubeadm 源码修改
+ kubernetes 高可用构建

