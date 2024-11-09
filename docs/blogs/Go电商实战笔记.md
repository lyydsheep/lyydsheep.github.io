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

