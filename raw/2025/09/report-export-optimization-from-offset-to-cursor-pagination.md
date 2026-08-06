# 10万行报表导出优化实战：从 OFFSET 到游标分页

> 这篇文章记录了一次大数据报表导出的优化实践。业务需求要求一次性导出10万条数据到Excel，最初采用全表扫描配合OFFSET分页，单次导出耗时超过30秒。经过分析慢查询日志，发现主要瓶颈在SQL层面和Excel写入方式。优化过程包括：只查询必要字段、去除无效条件、并发分片查询、流式写入Excel、最后引入游标分页避免大OFFSET扫描。最终导出耗时降至8秒。本文总结了SQL调优、分页策略以及大规模数据导出的关键经验。

记录一次大数据报表的优化

因为业务需求，需要一次性导出10万条数据的excel报表

第一次，我使用的全表扫描，花费8秒从数据库获取完整数据，将excel返回前端花了32秒，🤣

我想着这样不行

并对数据进行分片查询，并发读，流式写入文件，分片查询变成7秒，写入服务器6秒，总共13秒

## 查看对应的慢查询日志

```text
2025/09/03 22:30:15 /code/program/cloud-game/bzv2/kit/bzgorm/db_read_paginate.go:44 SLOW SQL >= 1s
[7465.336ms] [rows:10000] SELECT *,(CASE WHEN `channel_id_last`='NaN' THEN '0' ELSE `channel_id_last` END) AS `channel_id_last` FROM `member` WHERE `wx_nickname` LIKE '%%' AND `id`>0 ORDER BY `last_online_at` DESC,`id` DESC LIMIT 10000 OFFSET 90000

2025/09/03 22:30:15 /code/program/cloud-game/bzv2/kit/bzgorm/db_read_paginate.go:44 SLOW SQL >= 1s
[7780.825ms] [rows:10000] SELECT *,(CASE WHEN `channel_id_last`='NaN' THEN '0' ELSE `channel_id_last` END) AS `channel_id_last` FROM `member` WHERE `wx_nickname` LIKE '%%' AND `id`>0 ORDER BY `last_online_at` DESC,`id` DESC LIMIT 10000 OFFSET 80000
```

**SQL 执行的总耗时**，包含以下几个部分：

1. **生成 SQL 的时间**
  - GORM 会把条件、结构体、查询参数转换成 SQL 字符串，这个过程涉及反射和结构体解析。
2. **实际发送到数据库并返回结果的时间**
  - 这是主要耗时部分，包括网络通信、数据库解析、执行查询和返回结果。
3. **扫描结果到结构体的时间**
  - GORM 会把数据库返回的行扫描到 Go 结构体里，这里也可能会消耗一些时间，尤其是大结果集和复杂结构体。

## 优化查询

1. 只返回特定的字段

```bash
2025/09/04 00:06:13 /code/program/cloud-game/bzv2/kit/bzgorm/db_read_paginate.go:44 SLOW SQL >= 1s
[1952.019ms] [rows:10000] SELECT long_id,wx_nickname,created_at,last_online_at,address_last,user_agent_last,vip,pay_count,coin,score,agent_id,promoter_id FROM `member` WHERE `wx_nickname` LIKE '%%' AND `id`>0 ORDER BY `id` DESC LIMIT 10000 OFFSET 90000

# 省略...
```

明显快了很多

1. 简化查询逻辑

在代码逻辑上消除恒真匹配`%%`，也快了0.1s

如果你是 **MySQL 8.x**，两种写法性能差别不大，推荐用 **JOIN**，因为优化器对它的处理更可控。

如果是 **MySQL 5.7 或更老版本**，强烈建议用 **JOIN**，因为 `IN (子查询)` 很容易被执行成“外层逐条匹配内层”。

经过优化后我把程序修改了一下

```go
// MemberListExport 会员列表导出
func (s *LpjService) MemberListExport(c *gin.Context, param *MemberListDto) {
	user, ok := repository.Jwt.GetJwtData(c)
	if !ok || user == nil {
		bzgin.BadRequestResponse(c, "用户信息异常")
		return
	}

	filterFunc := s.memberListFilterFunc(param)

	// 会员汇总信息
	memberSummary, err := s.memberDomain.GetMemberSummary(func(tx *gorm.DB) *gorm.DB {
		tx = s.memberListSearchFilterFunc(param)(tx)
		return tx.Unscoped().Scopes(filterFunc, s.sysUserMemberFilter(user)).Order("`id` DESC")
	})

	if err != nil {
		bzgin.ErrorResponse(c, "获取会员汇总信息失败", err.Error())
	}

	// 流式对象初始化
	file := excelize.NewFile()
	sw, err := file.NewStreamWriter("Sheet1")
	if err != nil {
		bzgin.ErrorResponse(c, "创建流对象失败")
	}
	colNames := []any{"ID", "昵称", "注册时间", "最后登录时间", "地域", "设备端", "VIP级别", "总充值", "金币数", "积分数", "代理ID", "代理昵称", "推广员ID", "推广员昵称"}
	sw.SetRow("A1", colNames)

	// 并发任务
	type memberChunk struct {
		rowData [][]any
		page    int
	}
	chunkSize := 10000                                                   // 数据块大小
	chunkCount := (int(memberSummary.Count) + chunkSize - 1) / chunkSize // 数据块个数
	memberCh := make(chan memberChunk, chunkCount)

	var wg sync.WaitGroup
	wg.Add(chunkCount)
	// 生产者
	for i := 0; i < chunkCount; i++ {
		go func(currentPage int) {
			defer wg.Done()
			list, _ := s.memberDomain.GetMembersWithLastPayTimeInPaginate(func(tx *gorm.DB) *gorm.DB {
				tx = tx.Debug()
				tx = s.memberListSearchFilterFunc(param)(tx)
				tx = tx.Unscoped().
					Select("long_id,wx_nickname,created_at,last_online_at,address_last,user_agent_last,vip,pay_count,coin,score,agent_id,promoter_id").
					Scopes(filterFunc, s.sysUserMemberFilter(user))
				return tx.Order("`id` DESC")
			}, currentPage, chunkSize)
			data := list.Data.([]*model.MemberWithIDNumberAndAgentPromoter)
			fmt.Println("len(data)", len(data))
			startRow := int64(2 + currentPage*chunkSize) // 每个分页对应 Excel 的起始行
			fmt.Println("startRow", startRow)

			rowData := make([][]any, len(data))
			for idx, m := range data {
				row := []any{
					m.LongId,     // ID
					m.WxNickname, // 昵称
					m.CreatedAt.Format("2006-01-02 15:04:05"),    // 注册时间
					m.LastOnlineAt.Format("2006-01-02 15:04:05"), // 最后登录时间
					m.AddressLast,         // 地域
					m.UserAgentLast,       // 设备端
					m.Vip,                 // VIP级别
					m.PayCount,            // 总充值
					m.Coin,                // 金币数
					m.Score,               // 积分数
					m.AgentId,             // 代理ID
					m.Agent.WxNickname,    // 代理昵称
					m.PromoterId,          // 推广员ID
					m.Promoter.WxNickname, // 推广员昵称
				}
				rowData[idx] = row
			}
			memberCh <- memberChunk{rowData: rowData, page: currentPage}
		}(i)
	}

	wg.Wait()
	close(memberCh)

	// 消费者, 并发写Excel不安全，放在主goroutine串行处理
	for mc := range memberCh {
		rowStart := 2 + mc.page*chunkSize
		for idx, row := range mc.rowData {
			sw.SetRow(fmt.Sprintf("A%d", rowStart+idx), row)
		}
	}
	// 将缓冲写入excel
	if err := sw.Flush(); err != nil {
		bzgin.ErrorResponse(c, "缓冲写入excel失败", err.Error())
	}

	// 设置响应头，提示浏览器下载
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=report.xlsx")
	c.Header("Content-Transfer-Encoding", "binary")

	// 把 Excel 内容写入响应
	if err := file.Write(c.Writer); err != nil {
		bzgin.ErrorResponse(c, "导出失败", err.Error())
		return
	}
}
```

对应的日志：

```bash
2025/09/04 23:59:39 /code/program/cloud-game/bzv2/kit/bzgorm/db_read_paginate.go:44 SLOW SQL >= 1s
[2037.051ms] [rows:10000] SELECT long_id,wx_nickname,created_at,last_online_at,address_last,user_agent_last,vip,pay_count,coin,score,agent_id,promoter_id FROM `member` WHERE `id`>0 ORDER BY `id` DESC LIMIT 10000 OFFSET 90000

2025/09/04 23:59:39 /code/program/cloud-game/bzv2/kit/bzgorm/db_read_paginate.go:44 SLOW SQL >= 1s
[2039.847ms] [rows:10000] SELECT long_id,wx_nickname,created_at,last_online_at,address_last,user_agent_last,vip,pay_count,coin,score,agent_id,promoter_id FROM `member` WHERE `id`>0 ORDER BY `id` DESC LIMIT 10000 OFFSET 60000
 
# 省略...
```

> 注意：excelize写入是不能并发写入，不然会有数据缺块的问题，后面试了一下顺序插入，excelize只能排序后顺序插入，不要想着获取某一行的行标去并发的写入，这是血的教训

1. 最后我想了一下，使用**游标分页**，先利用主键的索引去快速找到上一页的lastId，然后使`id>lastId`，避免使用大offset跳表带来的性能开销

```go
// 优化：使用 lastId 作为子查询条件，避免大 OFFSET 性能问题
var lastId uint
if currentPage > 0 {
    // 只在第一页之后查找 lastId
    subQuery := s.deviceDB.Engine.Table("member").
    Select("id").
    Scopes(func(tx *gorm.DB) *gorm.DB {
        tx = s.memberListSearchFilterFunc(param)(tx)
        return tx.Unscoped().Scopes(filterFunc, s.sysUserMemberFilter(user))
    }).
    Order("`id`").
    Limit(1).
    Offset(currentPage * chunkSize - 1)
    if err := subQuery.Pluck("id", &lastId).Error; err != nil {
        bzgin.ErrorResponse(c, "lastId获取失败", err.Error())
        return
    }
}

query := s.deviceDB.Engine.Debug().Table("member").
		Select("long_id,member.wx_nickname,member.created_at,member.last_online_at,member.address_last,member.user_agent_last,member.vip,member.pay_count,member.coin,member.score,member.agent_id,s1.wx_nickname AS agent_wx_nickname,member.promoter_id,s2.wx_nickname AS promoter_wx_nickname").
Joins("LEFT JOIN cloud_game_admin.sys_user AS s1 ON member.agent_id = s1.user_id").
Joins("LEFT JOIN cloud_game_admin.sys_user AS s2 ON member.promoter_id = s2.user_id").
Scopes(func(tx *gorm.DB) *gorm.DB {
    tx = s.memberListSearchFilterFunc(param)(tx)
    return tx.Unscoped().Scopes(filterFunc, s.sysUserMemberFilter(user))
}).
Order("`id`").
Limit(chunkSize)

if currentPage > 0 && lastId > 0 {
    query = query.Where("member.id > ?", lastId)
}
```

对应日志

```bash
2025/09/05 10:48:45 /code/program/cloud-game/cloud-game-hub-jxcw/admin-h5-server/internal/service/lpj_service_member.go:448
[284.715ms] [rows:10000] SELECT long_id,member.wx_nickname,member.created_at,member.last_online_at,member.address_last,member.user_agent_last,member.vip,member.pay_count,member.coin,member.score,member.agent_id,s1.wx_nickname AS agent_wx_nickname,member.promoter_id,s2.wx_nickname AS promoter_wx_nickname FROM `member` LEFT JOIN cloud_game_admin.sys_user AS s1 ON member.agent_id = s1.user_id LEFT JOIN cloud_game_admin.sys_user AS s2 ON member.promoter_id = s2.user_id WHERE `id`>0 ORDER BY `id` LIMIT 10000

2025/09/05 10:48:45 /code/program/cloud-game/cloud-game-hub-jxcw/admin-h5-server/internal/service/lpj_service_member.go:448
[394.829ms] [rows:10000] SELECT long_id,member.wx_nickname,member.created_at,member.last_online_at,member.address_last,member.user_agent_last,member.vip,member.pay_count,member.coin,member.score,member.agent_id,s1.wx_nickname AS agent_wx_nickname,member.promoter_id,s2.wx_nickname AS promoter_wx_nickname FROM `member` LEFT JOIN cloud_game_admin.sys_user AS s1 ON member.agent_id = s1.user_id LEFT JOIN cloud_game_admin.sys_user AS s2 ON member.promoter_id = s2.user_id WHERE member.id > 20042 AND `id`>0 ORDER BY `id` LIMIT 10000
```

## 总结

经过这次实践，我对sql调优有了初步的认知

1. 为查询的字段建立合适的索引
2. 只返回需要的字段【看起来不重要，实则很有用】
3. 利用子查询【即通过primary key返回的id或idList】当作条件，相比全表排序后利用Index快
4. 使用游标分页，记录lastId
5. 合理使用Explain关键字
