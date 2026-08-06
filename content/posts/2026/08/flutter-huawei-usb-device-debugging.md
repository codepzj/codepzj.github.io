---
title: "macOS 使用华为手机调试 Flutter：ADB 设备为空排查"
description: "记录在 macOS 上连接华为 Android 真机运行 Flutter 项目的完整过程，包含 ADB 无线配对与连接、USB 调试、MTP 模式、adb devices 为空及首次 Gradle 构建排查。"
date: '2026-08-04'
updated: '2026-08-06'
categories:
- 移动开发
tags:
- Flutter
- Android
- ADB
- 华为
- macOS
---

Flutter Android 项目除了使用模拟器，也可以直接连接 Android 手机进行真机调试。真机能够更准确地验证相机、通知、定位、蓝牙、性能以及不同厂商系统的兼容性。

本文记录一次在 macOS 上连接华为手机运行 Flutter 项目的完整排障过程：最初 `adb devices` 一直为空，最终将手机的 USB 模式切换为 `MTP` 后成功识别设备，并通过 `flutter run` 启动项目。

如果 Flutter、Android Studio 和 Android SDK 尚未安装，可以先参考[macOS 搭建 Flutter Android 与 iOS 开发环境](/2026/08/flutter-macos-environment-setup)。

## 无线配对还是 USB 连接

Android 11 及以上版本通常支持无线调试，可以通过配对码或二维码连接 Android Studio。无线调试适合日常开发，但首次连接时，USB 仍然是最稳定、最容易判断问题所在的方式。

| 连接方式 | 优点 | 注意事项 |
|---|---|---|
| USB 数据线 | 稳定、延迟低、排障简单 | 线材和接口必须支持数据传输 |
| 二维码无线配对 | 不需要长期插线 | 手机和 Mac 通常需要位于同一局域网 |
| ADB TCP/IP | 可手动指定 IP 连接 | 首次启用时经常仍需要 USB |

::alert{type="info" title="建议首次连接使用 USB"}
如果 `adb devices` 完全为空，先通过 USB 建立一条可靠的数据连接。确认真机调试正常后，再切换到无线调试会更容易排查问题。
::

## 使用二维码无线配对

如果华为手机的“无线调试”页面提供“使用二维码配对设备”，可以尝试以下流程。

1. Mac 和手机连接同一个 Wi-Fi。
2. 手机进入“设置 → 系统和更新 → 开发人员选项 → 无线调试”。
3. 开启无线调试，选择“使用二维码配对设备”。
4. Android Studio 打开“Device Manager → Pair Devices Using Wi-Fi → Pair using QR code”。
5. 使用无线调试页面提供的扫码功能扫描二维码。

配对完成后执行：

```bash [检查无线设备]
adb devices -l
flutter devices
```

不同 EMUI 或 HarmonyOS 版本提供的选项可能不同。如果手机没有二维码配对入口，可以使用配对码，或者直接使用 USB 连接。

## 使用配对码连接无线 ADB

Android 11 及以上版本的无线调试分为两个步骤：先使用 `adb pair` 完成配对，再使用 `adb connect` 建立连接。配对通常只需要执行一次，而重新开启无线调试或网络发生变化后，可能需要再次执行连接。

::alert{type="warning" title="配对端口和连接端口不同"}
`adb pair` 使用“使用配对码配对设备”页面显示的配对端口；`adb connect` 使用“无线调试”主页面显示的 IP 地址和端口。不要将两个端口混用。
::

首先在手机中进入“设置 → 系统和更新 → 开发人员选项 → 无线调试”，点击“使用配对码配对设备”。页面会显示 IP 地址、配对端口和六位配对码，例如：

```text [无线配对信息]
IP 地址：192.168.0.106
配对端口：45333
配对码：123456
```

在 Mac 中执行：

```bash [配对无线设备]
adb pair 192.168.0.106:45333
```

根据提示输入手机显示的配对码。出现以下信息说明配对成功：

```text
Successfully paired to 192.168.0.106:45333
```

此时只是完成了 **Pair（配对）**，设备不一定会立即出现在 `adb devices` 中。返回手机的“无线调试”主页面，查看当前的“IP 地址和端口”，例如：

```text [无线连接信息]
IP 地址和端口：192.168.0.106:39175
```

这里的 `39175` 是连接端口。使用它执行：

```bash [连接无线设备]
adb connect 192.168.0.106:39175
```

连接成功后会看到：

```text
connected to 192.168.0.106:39175
```

最后检查 ADB 和 Flutter 是否已经识别设备：

```bash [检查无线设备]
adb devices -l
flutter devices
```

`adb devices -l` 应该出现类似结果：

```text
192.168.0.106:39175 device product:... model:... device:...
```

如果 `adb connect` 提示连接失败，确认手机和 Mac 位于同一个局域网，并重新查看无线调试主页面中的连接端口。无线调试关闭后重新开启时，连接端口可能发生变化。

## 使用 USB 连接华为手机

完整连接流程可以分为四步：

::timeline
{1. 开启开发者选项}

连续点击版本号，进入开发人员选项。

{2. 开启 USB 调试}

允许当前 Mac 通过 ADB 调试手机。

{3. 建立 USB 数据连接}

使用支持数据传输的线材，并选择 MTP 模式。

{4. 运行 Flutter 项目}

确认 ADB 设备状态为 `device`，再执行 `flutter run`。
::

### 开启开发者选项

在华为手机中进入“设置 → 关于手机”，连续点击“版本号”7 次。系统提示已进入开发者模式后，返回：

```text
设置
└── 系统和更新
    └── 开发人员选项
```

开启以下选项：

- `USB 调试`
- `仅充电模式下允许 ADB 调试`，如果系统提供该选项

### 使用支持数据传输的线材

手机能够充电，不代表 USB 数据连接一定正常。部分数据线只有供电能力，部分扩展坞的 USB-C 接口也可能只是 PD 充电口。

排障时建议：

- 手机保持解锁状态。
- 使用明确支持数据传输的 USB 线。
- 暂时绕过显示器、转接器和扩展坞。
- 将手机直接连接到 Mac 的 USB 接口。

::alert{type="warning" title="充电正常不代表数据正常"}
当 `adb devices` 完全为空时，最常见的原因不是 Flutter，而是线材、扩展坞接口或手机的 USB 模式没有建立数据连接。
::

### 选择 MTP 模式

连接手机后，下拉通知栏，打开 USB 用途设置。华为手机可能显示以下选项：

| 模式 | 用途 | 调试建议 |
|---|---|---|
| MTP | 文件传输 | 优先选择，确保进入 USB 数据连接模式 |
| PTP | 照片传输 | 主要用于导入照片 |
| RNDIS | USB 网络共享 | 将手机作为网络设备使用 |
| MIDI | MIDI 乐器和音频设备 | 与 Android 调试无关 |

本次连接中，手机最初只能充电，`adb devices` 没有任何设备。选择 `MTP` 后，Mac 收到了 USB 数据信号，手机随即弹出 USB 调试授权窗口。

在授权窗口中勾选“始终允许使用这台计算机”，然后点击“允许”。

## 检查 ADB 连接状态

首先执行：

```bash [检查 ADB 设备]
adb devices -l
```

如果设备列表为空，可以重启 ADB 服务：

```bash [重启 ADB]
adb kill-server
adb start-server
adb devices -l
```

ADB 服务正常启动，但列表仍然为空时，说明 Mac 尚未识别到手机的 USB 调试接口。此时应继续检查线材、接口和 USB 模式，而不是重新安装 Flutter。

常见状态如下：

| 输出状态 | 含义 | 处理方式 |
|---|---|---|
| 完全为空 | 没有建立 USB 数据连接 | 切换 MTP、换线、换接口、绕过扩展坞 |
| `unauthorized` | 手机尚未授权当前 Mac | 解锁手机并允许 USB 调试 |
| `offline` | ADB 会话异常 | 重插数据线并重启 ADB |
| `device` | 连接正常 | 可以运行 Flutter 项目 |

本次成功连接后，输出如下：

```text [成功识别华为手机]
List of devices attached
ANYXVB4C04002519  device usb:18022400X product:BVL-AN00 model:BVL_AN00 device:HNBVL-AN00 transport_id:2
```

其中最重要的是设备编号后的状态为 `device`。

::alert{type="info" title="macOS 通常不需要安装华为驱动"}
macOS 使用 Android Platform-Tools 中的 ADB 与手机通信，一般不需要额外安装 Windows 平台常见的手机 USB 驱动。
::

## 没有出现授权弹窗怎么办

如果已经选择 MTP，但手机没有弹出 USB 调试授权窗口，可以依次执行：

1. 进入“开发人员选项”。
2. 点击“撤销 USB 调试授权”。
3. 关闭并重新开启 USB 调试。
4. 将“默认 USB 配置”设置为文件传输或 MTP。
5. 拔掉数据线并重新连接。

还可以检查 macOS 是否在 USB 总线上识别到手机：

```bash [检查 macOS USB 设备]
system_profiler SPUSBDataType
```

如果这里也完全看不到手机，优先更换线材或连接接口。

## 使用 Flutter 运行项目

ADB 状态正常后，检查 Flutter 是否能够发现设备：

```bash [检查 Flutter 设备]
flutter devices
```

进入 Flutter 项目目录并运行：

```bash [运行到默认设备]
flutter run
```

如果同时连接了多个模拟器或真机，可以指定设备编号：

```bash [指定华为手机]
flutter run -d ANYXVB4C04002519
```

正常情况下会看到：

```text
Launching lib/main.dart on BVL AN00 in debug mode...
Running Gradle task 'assembleDebug'...
```

第一次运行 Android 项目通常比较慢，因为 Gradle 需要下载依赖、编译 Android 工程并生成 Debug APK。构建完成后会继续安装应用并同步文件：

```text
Installing build/app/outputs/flutter-apk/app-debug.apk...
Syncing files to device...
```

运行期间可以使用以下快捷键：

| 按键 | 作用 |
|---|---|
| `r` | 热重载 |
| `R` | 热重启 |
| `h` | 查看全部命令 |
| `q` | 停止调试 |

## 快速排障顺序

当 `adb devices` 没有显示华为手机时，按照下面的顺序排查通常最快：

```text
adb devices 为空
├── 手机是否解锁
├── USB 调试是否开启
├── 是否选择 MTP/文件传输
├── 是否弹出并允许 USB 调试授权
├── 数据线是否支持数据传输
├── 是否绕过扩展坞直接连接 Mac
└── 重启 ADB 后再次检测
```

::alert{type="tip" title="最终判断标准"}
只要 `adb devices -l` 中设备状态为 `device`，并且 `flutter devices` 能看到手机，就说明 Flutter 真机调试环境已经连接完成。
::

有线调试期间手机会同时充电，这是 USB 连接的正常行为。macOS 没有通用且可靠的方式在保持 ADB 数据连接的同时关闭供电。
