---
description: 记录Go整洁开发的一些技巧
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

## chapter3：自定义和归档日志

**两个重要的库**：[zap](https://github.com/uber-go/zap)、[umberjack](https://github.com/natefinch/lumberjack)

### 日志相关配置准备

**文件配置：**

```yaml
app:
  env: "dev"
  name: "go-mall"
  log:
    # 日志文件路径，从项目路径开始出发
    path: "./tmp/go-mall.log"
    # 文件最大体积（M）和有效期（Day）
    max_size: 1
    max_age: 60
```

**反序列化结构体：**

```go
type appConfig struct {
	// 用mapstructure标签就有效
	Env  string `mapstructure:"env"`
	Name string `mapstructure:"name"`
	Log  struct {
		FilePath    string `mapstructure:"path"`
		FileMaxSize int    `mapstructure:"max_size"`
		FileMaxAge  int    `mapstructure:"max_age"`
	}
}
```

### 初始化日志组件

**目录结构：**

![image-20241117150445307](https://raw.githubusercontent.com/lyydsheep/pic/main/202411171504369.png)

- env.go中定义了不同环境的枚举值
  - ![image-20241117183814150](https://raw.githubusercontent.com/lyydsheep/pic/main/202411171838214.png)

- zap.go中对**全局日志变量**进行初始化：这里使用Go自带的init方法进行初始化，也可以自己封装一个Init函数，在项目中手动调用函数完成初始化操作
  - 使用Go自带的init方法的弊端在于有的代码逻辑依赖于各个init的执行顺序，而这种初始化方法难以确保初始化顺序

```go
// zap只会当做基础Logger，所以只把该变量定义成包内访问的全局变量
var Logger *zap.Logger

func init() {
	// 配置encoder信息
	cfg := zap.NewProductionEncoderConfig()
	cfg.EncodeTime = zapcore.ISO8601TimeEncoder
	cfg.TimeKey = "time"
	cfg.MessageKey = "msg"
	encoder := zapcore.NewJSONEncoder(cfg)
	fileWriter := getFileLogWriter()
	var cores []zapcore.Core
	switch config.App.Env {
	case enum.ModeTest, enum.ModeProd:
		// 测试、生产环境仅将info级别级以上日志写入文件
		cores = append(cores, zapcore.NewCore(encoder, fileWriter, zapcore.InfoLevel))
	case enum.ModeDev:
		// 本地环境将所有的日志写入文件和控制台
		cores = append(cores, zapcore.NewCore(encoder, fileWriter, zapcore.DebugLevel),
			zapcore.NewCore(encoder, zapcore.WriteSyncer(os.Stdout), zapcore.DebugLevel))
	default:
		panic("config.App.Env is invalid")
	}
	// 类型定义实现接口
	core := zapcore.NewTee(cores...)
	Logger = zap.New(core)
}

func getFileLogWriter() zapcore.WriteSyncer {
	return zapcore.AddSync(&lumberjack.Logger{
		Filename:  config.App.Log.FilePath,
		MaxAge:    config.App.Log.FileMaxAge,
		MaxSize:   config.App.Log.FileMaxSize,
		Compress:  false,
		LocalTime: true,
	})
}
```

