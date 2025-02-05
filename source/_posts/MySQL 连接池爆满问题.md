---
date: 2025-02-04
title: MySQL 连接池爆满问题
tags: 
published: "false"
---
## Gorm 连接池常见参数
- `MaxIdleConns`：最大空闲连接数，即数据库连接池中最多存放多少连接
- `MaxOpenConn`：指定最大打开连接数，通常设置为最大并发数 N+10～50，超过这个值就会报`too many connections`的错误
- `ConnMaxLifetime`：连接最大存活时间，指定连接在连接池中最多能存活多久
- `ConnMaxIdleTime`：连接最大空闲时间，规定连接池中的连接最大空闲时长