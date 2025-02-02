---
date: 2025-01-29
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

## 10
- `show index form tableNmae`命令，可以查看索引的基数
- `analyze table tableName` 命令，可以原来重新统计索引信息
- 使用`force index`强制使用索引
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250127224059.png)

## 11
- 前缀索引可能会增加扫描行数
- 建立索引时需要关注的是区分度，区分度越高越好。依据不同的前缀索引长度的区分度，选取最合适的前缀长度
- 使用前缀索引就无法使用联合索引带来对查询性能的优化
- 如果不需要**范围查询**的需求，那么可以考虑**倒序存储**和**建立 hash 字段**的方法对查询进行优化
![image.png](https://raw.githubusercontent.com/lyydsheep/pic/main/20250129222949.png)

## 12
- 刷脏页导致数据库性能抖动的最常见的两个原因
	- 一个 SQL 语句涉及淘汰内存中多个脏页，导致查询的响应时间明显变长
	- redo log 写满，造成更新阻塞，写性能瞬间降至零
- 合理设置`innodb_io_capacity`，并且要多关注脏页的比例，不要让它经常接近 75%
	- `innodb_io_capacity`最好设置为磁盘的 IOPS，告知 innodb刷磁盘能力的上限

## 13
- `delete`命令删除数据的空间不会立即释放，而是被标记成可复用状态。因此频繁地`delete`、`update`、`insert`（无序时）会造成大量的内存碎片，导致索引空间不紧凑
- 可以使用`alter table A engine=innodb`命令重建表

## 15
- `on duplicate key update`：语法糖，重复（冲突）则更新
- `insert ignore`：语法糖，重复（冲突）则忽略

## 16
- MySQL 会为每个线程分配一块内存用于排序，称为 sort_buffer
- 如果要排序的数据量小于`sort_buffer_size`，那么排序操作能在内存中完成。否则，就不得不利用磁盘临时文件辅助排序
- 如果 MySQL认为排序内存太小，会影响排序效率，就会采用`rowid`排序算法，这样排序过程中一次可以排序更多行，但是最后需要回到原表取数据