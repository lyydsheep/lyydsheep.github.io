---
date: 2025-11-09
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



**清理策略**

可以通过设置`.spec.revisionHistoryLimit`项来指定 deployment 最多保留多少 revision 历史记录。默认的会保留所有的 revision；如果该项设置为 0，deployment 就不允许回退了。



### DaemonSet
DaemonSet 确保全部 Node 上运行一个 Pod 副本。当有 Node 加入集群时，也会为它们新增一个 Pod。当有 Node 从集群中移除时，这些 Pod 也会被回收。删除 DaemonSet 会将其创建的所有 Pod 删除。



**典型用法**

+ 运行集群存储 Daemon
+ 在每个 Node 上运行日志收集 Daemon
+ 在每个 Node 上运行监控 Daemon



### Job
Job 负责批处理任务，即仅执行一次的任务，它保证批处理任务的一个或多个 Pod成功结束。

**特殊说明**

+ spec.template 格式同 Pod
+ RestartPolicy 仅支持 Never 或 OnFailure
+ 单个 Pod 时，默认 Pod 成功运行后 Job 即结束
+ spec.completions 标志 Job 结束需要成功运行的 Pod 个数，默认为 1
+ spec.parallelism 表示并行运行的 Pod 个数，默认为 1
+ activeDeadlineSeconds 表示失败 Pod 的重试最大时间，超过这个时间不会继续重试



### Cron Job
管理基于时间的 Job，即

+ 在给定时间只运行一次
+ 周期性地在给定时间点运行

**典型用法**

+ 在给定时间点调度 Job 运行
+ 创建周期性运行的 Job，例如：数据库备份、发送邮件

**配置**

+ spec.schedule：调度，必需字段，指定任务运行周期，格式同 Cron
+ spec.jobTemplate：Job 模板
+ spec.startingDeadlineSeconds：启动 Job 的期限，如果因为任何原因错过了被调度的时间，那么错过执行时间的 Job 将被认为是失败的。如果没有指定，则没有期限
+ spec.concurrencyPolicy：并发策略，指定了如何处理被 Cron Job 创建的 Job 的并发执行
    - Allow：允许并发运行 Job
    - Forbid：禁止并发执行，如果前一个 Job 没有完成工作，则跳过下一个 Job
    - Replace：取消当前运行的 Job，用一个新的来替换
+ spec.suspend：挂起，如果设置为 true，后续所有执行都会被挂起
+ spec.successfulJobsHistoryLimit 和 spec.failedJobsHistoryLimit：表示可以保留多少完成和失败的 Job，默认情况分别设置为 3 和 1。



## Service
**实现机制的迭代**

在 v1.0 版本中，代理完全在 userspace，在 v1.1 版本中，新增了 iptables 代理，在 v1.8 版本中新增了 IP vs 代理。

+ userspace
    - kube-proxy 监听 apiserver，如果Service 发生了变化，那么就修改本地的 iptables 规则。代理来自当前 Pod 的用户请求

![](https://raw.githubusercontent.com/lyydsheep/pic/main/202511091519946.png)

+ iptables
    - kube-proxy 只负责修改本地的 iptables，不再代理用户请求，通过 iptables 将对数据包进行 NAT 转换

![](https://raw.githubusercontent.com/lyydsheep/pic/main/20251109152048.png)

+ ipvs

![](https://raw.githubusercontent.com/lyydsheep/pic/main/20251109152123.png)

```bash
# 修改 kube-proxy 模式
kubelet edit configmap kube-proxy -n kube-system 
mode: ipvs 
# 删除已有的pod，通过新的配置创建 Pod
kubectl delete pod -n kube-system -l k8s-app=kube-proxy 
```



### 类型
+ ClusterIP：默认类型，自动分配一个仅 Cluster 内部访问的 VIP
+ NodePort：在 Cluster 基础上为 Service 绑定一个宿主机端口，外界就能通过<NodeIP>:NodePort 形式来访问该服务
+ LoadBalancer：在 NodePort 基础上，借助 cloud provider 创建一个外部 LB，并将请求转发到<NodeIP>:NodePort
+ ExternalName：把集群外部服务引入到集群内部来，在集群内部直接使用

#### ClusterIP
![](https://raw.githubusercontent.com/lyydsheep/pic/main/20251109152213.png)

**svc dns 域名**

+ svcName.nsName.svc.domainName.
    - domainName：默认为 cluster.local

**svc.spec.internalTrafficPolicy**

+ Cluster：将流量路由到所有的端点
+ Local：只将流量路由到当前 Pod 所在的 Node上，如果 Node 上没有对应的 Pod，那么流量会被丢弃

**svc.spec.externalTrafficPolicy**

+ Cluster：将流量路由到所有的端点
+ Local：只将流量路由到当前 Pod 所在的 Node上，如果 Node 上没有对应的 Pod，那么流量会被丢弃

**svc.spec.sessionAffinity**

+ 会话亲和性，用于实现持久化链接

![](https://raw.githubusercontent.com/lyydsheep/pic/main/20251109152500.png)

#### NodePort
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20251109152610.png)

在 clusterIP 基础上，将 service 的端口和物理主机网卡进行绑定，将内部服务暴露给外部用户访问

#### **ExternalName**
将集群内部的请求映射到集群外部的域名（例如集群外的数据库），它是通过 DNS 别名（CNAME）来实现的

### Endpoints
Service 底层维护了一个同名的 Endpoints 对象，在 Endpoints 对象中存储了 Service 关联的 Pods 的IP 和端口信息。通过 Endpoints 中的信息，Service 就能通过适当的算法将请求转发到具体的 Pod

+ 有标签选择器
    - 自动创建一个同名的 Endpoints 资源对象，存储标签选择器（当前命名空间）匹配的Pod信息
+ 没有定义标签选择器
    - 不会创建同名的 Endpoints 资源对象，需要管理员手动创建并填写对应的端点信息

![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20251109152622.png)

## 存储
### 存储分类
+ 元数据
    - configMap：用于保存配置数据（明文）
    - Secret：用于保存敏感性数据（编码）
    - Downward API：容器运行时从 kubernetes API 服务器获取有关它们自身的信息
+ 真实数据
    - Volume：用于存储临时或持久性数据
    - PersistentVolume：申请制的持久化存储

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

# 对 deployment 打补丁，设置滚动更新策略
kubectl patch deployment demo-deployment -p '{"spec":{"strategy":{"type":"RollingUpdate","rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'

# 暂停滚动更新
kubectl rollout pause deploy demo-deployment

# 恢复滚动更新
kubectl rollout resume deploy demo-deployment

# 查看滚动更新状态
kubectl rollout status deployment/demo-deployment

# 查看历史版本
kubectl rollout history deployments demo-deployment

# 回滚到指定的版本
kubectl rollout undo deployment/demo-deployment --to-revision=2

# 修改 kube-proxy 模式
kubelet edit configmap kube-proxy -n kube-system 
mode: ipvs 
kubectl delete pod -n kube-system -l k8s-app=kube-proxy # 删除已有的pod，通过新的配置创建 Pod

# while 循环
while true; do curl myapp-clusterip.default.svc.cluster.local./hostname.html && sleep 11; done
```
