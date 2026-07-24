---
title: "Kratos 事务管理与循环依赖解决方案"
description: "介绍 Kratos 项目中的事务抽象方法，并通过接口解耦解决 data 与 biz 层之间的循环依赖。"
date: '2026-04-12'
updated: '2026-04-12'
categories:
- 微服务
tags:
- Kratos
- 事务管理
---

`Kratos` 当中的数据流向是 `server -> biz -> data`



`data` 需要实现 `biz` 中定义的接口，利用注入的基础设施做 `crud`

但实际上我们需要在 `biz`层去开启事务的时候需要依赖于 `data` 层的 `DB`实例

如果在 data 层暴露一个 `GetDB` 的方法，看上去没什么问题，实际上会导致一个**循环依赖**的问题



对于这种情况，我们可以在 `data` 层去创建一个事务管理器，并在 `biz` 层去定义事务管理器需要实现的接口，这样抽离公共模块能保证代码的文件运行同时保证解耦。



## 代码相关实现

```go
shortvid-service/internal/data/tx.go
package data

import (
	"shortvid-backend/app/shortvid-service/internal/biz"

	"github.com/go-kratos/kratos/v2/log"
	"gorm.io/gorm"
)

type txRepo struct {
	data *Data
}

func NewTxRepo(data *Data) biz.TxRepo {
	return &txRepo{
		data: data,
	}
}

func (r *txRepo) ExecFunc(fn func(tx *gorm.DB) error) error {
	err := r.data.db.Transaction(func(tx *gorm.DB) error {
		return fn(tx)
	})
	if err != nil {
		r.data.logger.Log(log.LevelError, "error", "transaction failed")
		return err
	}
	return nil
}
```

biz 层的接口

```go
shortvid-service/internal/biz/tx.go
package biz

import "gorm.io/gorm"

// 事务聚合器
type TxRepo interface {
	ExecFunc(fn func(*gorm.DB) error) error
}
```



在真正用到事务的时候将`TxRepo`注入到 `biz` 的结构体当中

代码示例：

```go
type UsersRepo interface {
	CreateUser(ctx context.Context, user *model.User) error
	CreateUserWithTx(ctx context.Context, tx *gorm.DB, user *model.User) error
	GetUserByEmailAndProvider(ctx context.Context, email string, provider string) (*model.User, error)
	GetUserByUID(ctx context.Context, UID int) (*model.User, error)
	UpdateLoginInfo(ctx context.Context, userUID int) error
}

type UsersUsecase struct {
	logger      log.Logger
	txRepo      TxRepo
	repo        UsersRepo
	accountRepo AccountRepo
}

// FirebaseFindOrCreateUser 查询或创建用户[Firebase]
func (uc *UsersUsecase) FirebaseFindOrCreateUser(ctx context.Context, dto *UserDTO) (*UserProfileVO, bool, error) {
	// 判断账户是否存在
	existAcc, err := uc.accountRepo.GetByEmailAndProvider(ctx, dto.Email, dto.Provider)
	if err != nil {
		uc.logger.Log(log.LevelError, "msg", "Get account by email and provider failed", "error", err)
		return nil, false, err
	}
	if existAcc != nil {
		// 账户存在, 继续查找用户
		existUser, err := uc.repo.GetUserByUID(ctx, existAcc.UID)
		if err != nil {
			uc.logger.Log(log.LevelError, "msg", "Get user by uid failed", "error", err)
			return nil, false, err
		}
		if existUser == nil {
			return nil, false, errors.New("account exists, but user not found")
		}

		return &UserProfileVO{
			ID:          existUser.ID,
			UID:         existUser.UID,
			Ctime:       existUser.CreatedAt.Unix(),
			Nickname:    existUser.Nickname,
			Avatar:      existUser.Avatar,
			Email:       existAcc.Email,
			Provider:    existAcc.Provider,
			ProviderUID: existAcc.ProviderUID,
		}, false, nil
	}

	// 创建账户和用户(强关联操作)
	user := &model.User{
		Nickname:    dto.Nickname,
		Avatar:      dto.Avatar,
		LastLoginAt: time.Now(),
	}
	account := &model.Account{
		Email:       dto.Email,
		Provider:    dto.Provider,
		ProviderUID: dto.ProviderUID,
	}
	err = uc.txRepo.ExecFunc(func(tx *gorm.DB) error {
		maxCount := 10
		for range maxCount {
			// 生成唯一的UID
			user.UID = uc.generateUniqueUserUID()
			err := uc.repo.CreateUserWithTx(ctx, tx, user)

			if err != nil {
				var mysqlErr *mysql.MySQLError
				if errors.As(err, &mysqlErr) && mysqlErr.Number == 1062 {
					uc.logger.Log(log.LevelInfo, "msg", "UserUID already exists, retrying", "userUID", user.UID)
					continue
				}
				uc.logger.Log(log.LevelError, "msg", "Create user failed", "error", err)
				return err
			}
			break
		}

		account.UID = user.UID
		err := uc.accountRepo.CreateAccountWithTx(ctx, tx, account)
		if err != nil {
			uc.logger.Log(log.LevelError, "msg", "Create account failed", "error", err)
			return err
		}

		return nil
	})

	if err != nil {
		uc.logger.Log(log.LevelError, "msg", "Create user and account failed", "error", err)
		return nil, false, err
	}

	return &UserProfileVO{
		ID:          user.ID,
		UID:         user.UID,
		Ctime:       user.CreatedAt.Unix(), // 创建时间
		Nickname:    user.Nickname,         // 昵称
		Avatar:      user.Avatar,           // 头像
		Email:       account.Email,         // 邮箱
		Provider:    account.Provider,      // 提供商
		ProviderUID: account.ProviderUID,   // 提供商UID
	}, true, nil
}
```
