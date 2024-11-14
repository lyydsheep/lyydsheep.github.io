---
description: 记录Go实战项目的一些技巧
tags:
- Go
- 项目
---



# Go实战笔记

## chapter1

`gin.H`本质是一个`map[string]interface{}`的类型别名。它主要用于灵活方便地构造JSON格式数据

```go
func main() {
	server := gin.Default()
	server.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	server.Run(":8080")
}
```

## chapter2：配置

**文件结构：**

![image-20241113164141040](https://raw.githubusercontent.com/lyydsheep/pic/main/202411131641068.png)

- 三个`yaml`文件分别对应不同的场景

- config文件中定义读取配置所需的结构体类型

```go
package config

import "time"

var (
	App      appConfig
	DataBase dataBaseConfig
)

type appConfig struct {
	Env  string `yaml:"env"`
	Name string `yaml:"name"`
}

type dataBaseConfig struct {
	Type        string        `yaml:"type"`
	Dsn         string        `yaml:"dsn"`
	MaxOpen     int64         `yaml:"max_open"`
	MaxIdle     int64         `yaml:"max_idle"`
	MaxFileTime time.Duration `yaml:"max_file_time"`
}
```

- bootstrap文件定义初始化配置的方法

```go
//go:embed *.yaml
var configs embed.FS

func init() {
	fileName := os.Getenv("fileName")
	fmt.Println(fileName)
	vp := viper.New()
	configFileStream, err := configs.ReadFile("application." + fileName + ".yaml")
	if err != nil {
		panic(err)
	}
	vp.SetConfigType("yaml")
	err = vp.ReadConfig(bytes.NewReader(configFileStream))
	if err != nil {
		panic(err)
	}
	err = vp.UnmarshalKey("app", &App)
	if err != nil {
		panic(err)
	}
	err = vp.UnmarshalKey("database", &DataBase)
	if err != nil {
		panic(err)
	}
}
```

**将配置文件和项目一起打包**

使用go:embed功能可以将静态文件嵌入Go项目中，这样在调用`go build .`命令后配置文件就会和项目一块打包编译成可执行文件了

值得注意的是，只有在书写了go:embed的.go文件**同一级目录或子目录下**的静态文件才会被一起嵌入打包
