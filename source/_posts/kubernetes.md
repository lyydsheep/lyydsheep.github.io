---
date: 2025-10-18
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

## k8s 组件
+ 控制平面（Control Plane）组件
    - 负责维护集群的期望状态
+ 工作节点（Worker Node）组件
    - 负责运行容器化的应用程序

![](https://raw.githubusercontent.com/lyydsheep/pic/main/20251018213833.png)

+ API Server
    - 集群的总入口和前端接口
    - 功能
        * 处理所有的 RESTful 请求，是所有组件通信的唯一接口
        * 负责认证、授权和访问控制
        * 将集群的期望状态持久化到 etcd 中
+ scheduler
    - 调度器
    - 功能
        * 监控新创建的 Pod，根据资源需求、节点限制和各种调度策略，为 Pod 选择一个最合适的工作节点来运行
+ Controller Manager
    - 控制器
    - 功能
        * 确保某个 Pod 在任何时候都有指定数量的副本在运行
+ etcd	
    - 存储整个集群的所有持久化状态
+ kubelet
    - 节点代理
    - 功能
        * 接收并执行 API Server 的指令，确保节点上的 Pod 及其内部的容器处于 API Server 所定义的期望状态
+ kube-proxy	
    - 网络代理和服务抽象
    - 功能
        * 维护网络规则，负责将 Server IP 的流量转发并负载均衡到后端正确的 Pod 上

## 资源清单
k8s中的所有内容都称为资源，资源实例化后就是对象。

+ apiVersion：由 `Group / Version`组成，指定正在使用的资源版本
    - 可以使用`kubectl explain pod`查看对应的 apiVersion
+ kind：类别
+ metadata：对象的元数据
+ spec：用于描述用户期望的资源状态

### Pod 的生命周期
同一个 Pod 下的容器是共享资源，包括网络命名空间、存储卷、进程命名空间

![](https://raw.githubusercontent.com/lyydsheep/pic/main/20251018213728.png)



init 容器与普通的容器非常像，但有两个特殊点

+ init 容器总是运行到成功完成为止
+ 每个 init 容器都必须在下一个 init 容器启动之前成功完成工作

如果 Pod 的 init 容器失败，kubernetes 会不断重启该 Pod，指导 init容器成功为止。然而，如果 Pod 对应的 restartPolicy 为 Never，它不会重新启动。

#### 就绪探针
让 kubernetes 知道应用是否准备好其流量服务。kubernetes 确保 Readiness 探针检测通过，然后允许服务将流量发送到 Pod。如果 Readiness 探针开始失败，k8s 将停止向该容器发送流量，直到它通过。如果容器处于 Ready 状态，表示可以接受请求；否则会从 service 的endpoint 列表移除。

+ 成功：就绪
+ 失败：静默

#### 存活探针
让 k8s 知道应用程序是否健康，如果应用程序不健康，k8s 将启动一个新的替换它。这里的“健康”判断依据是由用户自定义的探测方式：HTTP、TCP、Exec。

+ 成功：静默
+ 失败：新启并替换

#### 启动探针
确保存活探针在执行的时候不会因为时间设定问题导致无限死亡或者延迟很长的情况

+ 成功：开始执行存活、就绪探针
+ 失败：静默
+ 未知：静默



**用户通过 Liveness 探针可以告诉 k8s 什么时候通过重启容器实现自愈；而就绪探针则是告诉 k8s 什么时候可以将容器加入到 service 负载均衡中，对外提供服务。**

#### 钩子
钩子分为启动后钩子和关闭前钩子，这两个钩子都是由当前节点上的 kubelet 负责执行。启动后钩子的执行时期可能会和容器启动后命令重合。



## Pod 控制器
在 Kubernetes 中运行了一系列控制器来确保集群的当前状态与期望状态保持一致，它们就是 k8s 集群内部的管理控制中心或者说是“中心大脑”。例如，RS 控制器负责维护集群中运行的 Pod 数量；Node 控制器负责监控节点的状态，并在节点出现故障时，执行自动化修复流程，确保集群始终处于预期的工作状态。



RC 控制器

+ 保障当前的 Pod 数量和期望值一致

RS 控制器

+ 功能与 RC 控制器类似，但是多了标签选择的运算方式

replace 和 apply 对比

+ kubectl replace：使用新的配置完全替换掉现有资源的配置。这意味着新配置将覆盖现有资源的所有字段和属性，包括未指定的字段，会导致整个资源的替换。
+ kubectl apply：使用新的配置部分地更新现有资源的配置。它会根据提供的配置文件或参数，只更改与新配置（显示声明的部分）中不同的部分，而不会覆盖整个资源的配置。



### Deployment
为 Pod 和 ReplicaSet 提供了一个声明式定义方法，用来替代以前的 ReplicationController 来方便的管理应用。典型的应用场景：

+ 定义 Deployment 来创建 Pod 和 ReplicaSet
+ 滚动升级和回滚应用
+ 扩容和缩容
+ 暂停和继续 Deployment



**kubectl create、apply、replace**

+ create：创建资源对象
    - -f：通过基于文件的创建，但是如果此文件描述的对象存在，那么即使文件的信息发生了修改，再次提交时也不会应用
+ apply：创建资源对象、修改资源对象
    - -f：基于文件创建，如果目标对象和文件显示声明的属性有差异，那么就会根据文件一一修改目标对象的属性（部分更新）
+ replace：创建资源对象、修改资源对象
    - -f：基于文件创建，如果目标对象与文件表示的属性有差异（无论是显示还是隐式），那么会重建此对象（替换）



**更新策略**

Deployment 可以保证在升级时只有一定数量的 Pod 是 down，默认最多 25% 是不可用的。

Deployment 同时也可以确保只创建出超过期望数量的一定数量的 Pod，默认最多 25% 是 surge。

## 常用命令
```shell
# 获取当前资源，pod
kubectl get pods
  -A 查看所有命名空间的资源
  -n 指定命名空间，默认值 default，kube-system 空间存放的是当前组件资源
  --show-labels 查看当前的标签
  -l 筛选资源，key，key=val
  -o wide 详细信息，包括 IP、分配的节点
  -w 监视，打印当前资源对象的变化部分

# 进入 Pod 内部的容器执行命令
kubectl exec -it podName -c cName -- command

# 查看资源的描述
kubectl explain pod.spec

# 查看pod内部容器日志
kubectl logs podName -c cName

# 产看资源对象的详细描述
kubectl describe pod podName

# 删除资源对象
kubectl delete kindName objName
-- all # 删除资源的所有对象

# 手动调整副本数量（即时生效）
kubectl scale deployment/<deployment名称> --replicas=<期望的副本数>

# Deployment 常用命令
kubectl create -f deployment.yaml --record  # --record参数可以记录命令，我们可以很方便地查看每次 revision 的变化

kubectl scale deployment nginx-deployment --replicas 10

kubectl autoscale deployment nginx-deployment --min=10 --max=15 --cpu-percent=80

kubectl set image deployment/name-deployment name-container=abc/app:v2.0

kubectl rollout undo deployment/name-deployment
```

