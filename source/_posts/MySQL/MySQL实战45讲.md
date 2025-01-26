---
date: 2025-01-24
---

## 01
- 建立连接的过程是比较复杂的，因此尽量使用长连接，避免过多的短链接
	- 但是长连接积累下来会导致内存占用太大，强行被系统杀死（OOM）
	- 解决方法：
		- 定期断开长连接
		- MySQL 5.7 及之后的版本，通过执行mysql_reset_connection重新初始化连接资源

## 03
- 尽量不要使用长事务
	- 长事务意味着系统中存在很老的Read-View，在事务提交前，这些Read-View都必须保留，这就会导致占用大量存储空间
	- 除了对回滚段的影响，长事务还占用锁资源，也可能会拖垮整个数据库
- 总是使用`set autocommit = 1`，通过显示语句的方式来启动事务
- 频繁使用事务的业务，可以使用`commit work and chain`
	- 在`autocommit = 1`，通过`begin`显示开启事务的情况下，`commit`表示提交事务，`commit work and chain`表示提交事务并开启下一个事务，省去了`begin`语句的开销
- ![Screenshot 2025-01-17 at 22.18.29.png](https://raw.githubusercontent.com/lyydsheep/pic/main/Screenshot%202025-01-17%20at%2022.18.29.png)


## 04
- 哈希表适用于等值查询场景
- 有序数组适用于静态存储引擎
- 尽量使用主键查询原则
- 自增主键
	- 性能
	- 存储空间

## 05
![Screenshot 2025-01-18 at 22.33.22.png](https://raw.githubusercontent.com/lyydsheep/pic/main/Screenshot%202025-01-18%20at%2022.33.22.png)

## 06
- 如果事务中需要锁多个行，把最可能造成锁冲突、最影响并发度的锁尽量往后放
- 死锁检测要耗费大量的CPU资源

## 08
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250122200502.png)

## 09
- 对于写多读少的场景，页面在写完后马上访问的概率比较小，此时change buffer的效果最好。例如：账单类、日志类系统
