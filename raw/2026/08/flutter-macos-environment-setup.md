# macOS 搭建 Flutter Android 与 iOS 开发环境

> 记录在 Apple Silicon Mac 上搭建 Flutter 开发环境的完整过程，包括 Android Studio、Android SDK、模拟器、Xcode、CocoaPods、代理配置以及 flutter doctor 常见问题。

搭建 Flutter 开发环境不只是下载 Flutter SDK，还需要根据目标平台安装 Android SDK、Xcode、CocoaPods、模拟器等原生工具。第一次执行 `flutter doctor`，通常会看到 Android SDK、Xcode、CocoaPods 或代理相关的警告。

本文记录在 Apple Silicon Mac 上补齐 Flutter Android、iOS 和 Web 开发环境的完整过程。

## Flutter 各平台依赖关系

Flutter 项目的 Dart 代码可以使用 Android Studio、VS Code、Cursor 等编辑器编写，但不同目标平台仍然需要各自的原生工具链。

<table>
<thead>
  <tr>
    <th>
      目标平台
    </th>
    
    <th>
      必需工具
    </th>
    
    <th>
      主要作用
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Android
    </td>
    
    <td>
      Android Studio、Android SDK
    </td>
    
    <td>
      编译、打包、模拟器和真机调试
    </td>
  </tr>
  
  <tr>
    <td>
      iOS/macOS
    </td>
    
    <td>
      Xcode、CocoaPods
    </td>
    
    <td>
      iOS SDK、模拟器、签名和原生插件依赖
    </td>
  </tr>
  
  <tr>
    <td>
      Web
    </td>
    
    <td>
      Chrome
    </td>
    
    <td>
      Web 调试和运行
    </td>
  </tr>
</tbody>
</table>

<alert title="先确定目标平台" type="info">

只开发 Android 或 Web 时，可以暂时不安装完整 Xcode 和 CocoaPods；只有需要构建 iOS/macOS 应用时才需要补齐苹果工具链。

</alert>

整个环境搭建顺序如下：

<timeline>

{1. Flutter SDK}

下载 SDK、配置 `PATH`，确认 Flutter 命令可用。

{2. Android 工具链}

安装 Android Studio、SDK、许可证和 ARM64 模拟器。

{3. iOS/macOS 工具链}

安装完整 Xcode、Simulator Runtime 和 CocoaPods。

{4. 环境验收}

通过 `flutter doctor -v` 检查，并运行一个示例项目。

</timeline>

项目中的目录关系如下：

```text
Flutter 项目
├── android/  → Android Studio、Android SDK
├── ios/      → Xcode、CocoaPods
├── macos/    → Xcode、CocoaPods
├── web/      → Chrome
└── lib/      → 多个平台共享的 Dart 代码
```

iOS 应用只能在 macOS 上通过 Xcode 编译。平时仍然可以在 VS Code 或 Android Studio 中编写 Flutter 代码，只有配置签名、Capabilities 或修改原生 Swift 代码时才需要打开 Xcode。

## 安装 Flutter SDK

### 安装基础命令行工具

Flutter 在 macOS 上依赖 Git 等基础命令行工具。执行：

```bash
xcode-select --install
```

系统会弹出 Command Line Tools 安装窗口，按提示完成安装。

这里安装的是轻量的 Xcode 命令行工具，足以支持 Flutter SDK 和 Git。后面如果需要编译 iOS 或 macOS 应用，仍然要安装完整 Xcode。

<alert title="Command Line Tools 不等于完整 Xcode" type="warning">

`xcode-select --install` 只能安装基础命令行工具。它不能提供完整的 iOS SDK、模拟器和签名能力。

</alert>

检查 Git：

```bash
git --version
```

### 下载 Flutter SDK

打开 Flutter 官方手动安装页面：

[https://docs.flutter.dev/install/manual](https://docs.flutter.dev/install/manual)

根据 Mac 芯片选择正确的安装包：

- M1、M2、M3、M4 等 Apple 芯片：选择 Apple Silicon（ARM64）。
- Intel 芯片：选择 Intel（x64）。

可以通过下面的位置查看芯片类型：

```text
系统设置 → 通用 → 关于本机 → 芯片
```

本文使用 Apple Silicon Mac，因此下载 ARM64 的 stable 稳定版 SDK。

不建议直接将 Flutter SDK 放在 `Downloads`、`Desktop` 或带空格、特殊字符的目录中。可以创建专门的开发工具目录：

```bash
mkdir -p "$HOME/develop"
```

假设安装包已经下载到 `~/Downloads`，解压到 `~/develop`：

```bash
unzip ~/Downloads/flutter_macos_*-stable.zip -d "$HOME/develop"
```

解压后的目录结构类似：

```text
~/develop/flutter
├── bin
├── packages
└── examples
```

如果 `Downloads` 中存在多个 Flutter 压缩包，建议先删除旧版本，或者将命令中的通配符替换为实际文件名，避免一次解压多个文件。

### 配置 PATH

macOS 默认使用 Zsh。将 Flutter 的 `bin` 目录加入 `PATH`：

```bash [~/.zprofile]
echo 'export PATH="$HOME/develop/flutter/bin:$PATH"' >> ~/.zprofile
```

重新加载配置：

```bash
source ~/.zprofile
```

也可以关闭并重新打开终端。

验证命令路径：

```bash
which flutter
flutter --version
```

正常情况下，`which flutter` 会输出：

```text
/Users/你的用户名/develop/flutter/bin/flutter
```

第一次执行 Flutter 命令时会下载 Dart SDK 和部分缓存文件，需要等待一段时间。

### 切换和升级 Flutter 版本

查看当前发布渠道：

```bash
flutter channel
```

个人学习和普通项目建议使用稳定版：

```bash
flutter channel stable
flutter upgrade
```

安装完成后执行一次全面检查：

```bash
flutter doctor -v
```

此时 Flutter 本体应显示 `[✓]`。Android 或 iOS 工具链出现警告属于正常情况，继续按照后面的步骤补齐即可。

## 检查 Flutter SDK

先确认 Flutter 命令可以正常使用：

```bash
flutter --version
flutter doctor -v
```

例如：

```text
[✓] Flutter
[✗] Android toolchain - develop for Android devices
[!] Xcode - develop for iOS and macOS
[✓] Chrome - develop for the web
[✓] Connected device
[✓] Network resources
```

这表示 Flutter SDK 和 Web 环境已经可用，但 Android 与 iOS 的原生工具链还没有配置完整。

`flutter doctor` 是整个安装过程最重要的检查工具。每完成一个阶段，都可以重新运行一次确认结果。

## 配置 Android 开发环境

### 安装 Android Studio

下载并安装 Android Studio：

[https://developer.android.com/studio](https://developer.android.com/studio)

第一次打开 Android Studio 时，安装向导会下载 Android SDK。这里显示的 Android SDK 许可协议只是开发工具使用协议，不会产生费用。

首次安装需要从 Google 下载数百 MB 甚至更多组件，国内网络环境可能耗时较长。只要下载进度仍然变化，就继续等待，不要直接关闭 Android Studio。

### 安装 Android SDK 组件

打开 Android Studio：

```text
More Actions → SDK Manager
```

也可以在已打开项目的情况下进入：

```text
Settings → Languages & Frameworks → Android SDK
```

在 `SDK Platforms` 中至少安装一个需要使用的 Android SDK Platform。

在 `SDK Tools` 中确认安装：

- Android SDK Command-line Tools (latest)
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android Emulator

各组件用途如下：

- `Command-line Tools`：提供 `sdkmanager` 等命令，执行 Android 许可证检查时必需。
- `Platform-Tools`：包含 `adb`，用于连接真机、安装应用和调试。
- `Build-Tools`：用于编译、打包和签名 Android 应用。
- `Android Emulator`：用于运行 Android 虚拟设备。

普通 Flutter 项目暂时不需要安装 NDK 和 CMake。只有项目包含 C/C++ 原生代码或某些插件明确要求时再安装。

Android Sources 主要用于阅读系统源码，不是编译 Flutter 项目的必需组件。如果下载速度太慢，可以先取消 Sources，只保留核心工具。

### 配置 Android SDK 路径

macOS 默认的 Android SDK 目录通常是：

```text
/Users/你的用户名/Library/Android/sdk
```

可以让 Flutter 显式使用这个目录：

```bash
flutter config --android-sdk "$HOME/Library/Android/sdk"
```

接受 Android SDK 许可证：

```bash
flutter doctor --android-licenses
```

出现协议询问时输入 `y` 接受。

<alert title="许可证不会收费">

Android SDK 安装和 `flutter doctor --android-licenses` 显示的是开发工具使用协议。接受这些协议不会产生费用。

</alert>

如果提示找不到 `sdkmanager`，通常是没有安装 `Android SDK Command-line Tools (latest)`。返回 SDK Manager 补装后再执行即可。

最后检查：

```bash
flutter doctor -v
```

出现下面的结果，说明 Android 工具链已经配置成功：

```text
[✓] Android toolchain - develop for Android devices
```

## 创建 Android 模拟器

打开 Android Studio：

```text
More Actions → Virtual Device Manager
```

然后按以下步骤创建模拟器：

1. 点击 `+` 创建虚拟设备。
2. 选择 Pixel 等常用机型。
3. 下载并选择 Android 系统镜像。
4. 完成创建并点击启动按钮。

Apple Silicon Mac 应优先选择 `ARM64` 或 `arm64-v8a` 系统镜像。使用与 CPU 架构一致的镜像，启动速度和运行效率通常更好。

查看 Flutter 已识别的设备：

```bash
flutter devices
```

也可以连接 Android 真机。需要在手机的开发者选项中开启 USB 调试，并在首次连接时允许当前电脑进行调试。

## 配置 iOS 和 macOS 开发环境

### 安装完整 Xcode

如果 `flutter doctor` 显示：

```text
Xcode installation is incomplete; a full installation is necessary
```

说明当前可能只有 Xcode Command Line Tools，或者 Xcode 尚未完成初始化。开发 iOS 和 macOS 应用需要安装完整 Xcode。

可以直接在 Mac App Store 搜索并安装 Xcode，也可以从 Apple Developer 网站下载：

[https://developer.apple.com/xcode/](https://developer.apple.com/xcode/)

Xcode 本身免费。安装包和模拟器运行时占用空间较大，建议提前预留 30～50 GB 磁盘空间。

安装完成后先手动打开 Xcode 一次，接受协议并等待附加组件安装完成，然后执行：

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
sudo xcodebuild -license accept
```

如果需要 iOS 模拟器，可以在 Xcode 中打开：

```text
Xcode → Settings → Components
```

下载需要使用的 iOS Simulator Runtime。

启动模拟器：

```bash
open -a Simulator
```

### 安装 CocoaPods

CocoaPods 用于管理 Flutter 插件依赖的 iOS/macOS 原生库。没有 CocoaPods 时，部分插件无法在 iOS 或 macOS 上编译。

通过 Homebrew 安装：

```bash
brew install cocoapods
```

检查版本：

```bash
pod --version
```

必要时初始化本地 Specs 仓库：

```bash
pod setup
```

再次检查 Flutter 环境：

```bash
flutter doctor -v
```

当 Xcode 一项变成 `[✓]`，iOS 与 macOS 的基础开发环境就配置完成了。

## Xcode 和 Apple 开发者账号是否收费

Xcode、iOS 模拟器和本地开发都是免费的。是否收费主要取决于应用是否需要正式分发。

<table>
<thead>
  <tr>
    <th>
      使用场景
    </th>
    
    <th>
      免费 Apple 账号
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      学习 Flutter/iOS
    </td>
    
    <td>
      可以
    </td>
  </tr>
  
  <tr>
    <td>
      使用 iOS 模拟器
    </td>
    
    <td>
      可以
    </td>
  </tr>
  
  <tr>
    <td>
      在自己的 iPhone 上真机调试
    </td>
    
    <td>
      可以，但签名有效期和数量有限制
    </td>
  </tr>
  
  <tr>
    <td>
      发布到 App Store
    </td>
    
    <td>
      不可以
    </td>
  </tr>
  
  <tr>
    <td>
      使用 TestFlight 分发
    </td>
    
    <td>
      不可以
    </td>
  </tr>
  
  <tr>
    <td>
      正式证书和长期分发
    </td>
    
    <td>
      不可以
    </td>
  </tr>
</tbody>
</table>

发布 App Store 或使用 TestFlight，需要加入 Apple Developer Program。苹果通常按年收取会员费，具体价格以 Apple Developer 官方页面显示为准。

如果目前只学习 Flutter 或在自己的设备上调试，不需要立即付费。

## 处理代理警告

开启 Clash、V2Ray 等代理软件后，`flutter doctor` 可能提示：

```text
[!] Proxy Configuration
    ! NO_PROXY is not set
```

可以将本地地址排除在代理之外：

```bash
export NO_PROXY="localhost,127.0.0.1,::1"
export no_proxy="$NO_PROXY"
```

需要永久生效时，将配置加入 `~/.zshrc`：

```bash [~/.zshrc]
export NO_PROXY="localhost,127.0.0.1,::1"
export no_proxy="$NO_PROXY"
```

重新加载配置：

```bash
source ~/.zshrc
```

如果 Flutter 依赖可以正常下载，这个警告一般不会阻止开发，也可以暂时忽略。

## App Store 无法下载 Xcode

如果 App Store 可以打开 Xcode 页面，但点击“获取”时提示无法建立安全连接，通常与系统代理或代理节点的 TLS 处理有关。

<alert title="优先检查系统代理" type="error">

App Store 的下载页面可能可以正常访问，但“获取”接口的 TLS 校验更严格。代理节点或 HTTPS 检查可能导致安全连接失败。

</alert>

可以按以下顺序排查：

1. 使用 `Command + Q` 完全退出 App Store。
2. 暂时关闭代理软件的系统代理，或者直接退出代理软件。
3. 重新打开 App Store 并再次点击获取。
4. 如果仍然失败，切换到手机热点重试。
5. 检查系统是否开启自动设置日期和时间。
6. 退出 App Store 的 Apple ID 后重新登录。

如果必须使用代理，可以考虑让 Apple 相关域名直连：

```text
*.apple.com
*.apps.apple.com
*.itunes.apple.com
*.icloud.com
*.mzstatic.com
```

也可以绕过 App Store，从 Apple Developer Downloads 下载 Xcode：

[https://developer.apple.com/download/all/](https://developer.apple.com/download/all/)

## 配置编辑器

Android Studio 用户可以在插件市场安装：

- Flutter
- Dart

VS Code 用户可以安装官方 Flutter 扩展，Dart 扩展会作为依赖一同安装：

[https://marketplace.visualstudio.com/items?itemName=Dart-Code.flutter](https://marketplace.visualstudio.com/items?itemName=Dart-Code.flutter)

编辑器只是代码编写入口。即使使用 VS Code，构建 Android 仍然需要 Android SDK，构建 iOS 仍然需要 Xcode。

## 创建并运行 Flutter 项目

创建新项目：

```bash
flutter create flutter_demo
cd flutter_demo
```

安装依赖：

```bash
flutter pub get
```

查看设备：

```bash
flutter devices
```

运行项目：

```bash
flutter run
```

设备较多时，可以通过设备 ID 指定目标：

```bash
flutter run -d 设备ID
```

常见目标包括：

```bash
# Chrome
flutter run -d chrome

# macOS 桌面端
flutter run -d macos
```

## 最终检查

完整环境可以使用下面的命令验收：

```bash
flutter doctor -v
```

目标结果如下：

```text
[✓] Flutter
[✓] Android toolchain
[✓] Xcode
[✓] Chrome
[✓] Connected device
[✓] Network resources
```

不必为了所有勾选项一次性安装全部工具：

- 只开发 Android：Android toolchain 变绿后即可开始。
- 只开发 Web：Flutter 和 Chrome 正常即可。
- 开发 iOS/macOS：必须补齐完整 Xcode 和 CocoaPods。

根据实际目标平台安装依赖，可以减少磁盘占用和不必要的配置工作。

## 参考资料

- Flutter SDK 手动安装：[https://docs.flutter.dev/install/manual](https://docs.flutter.dev/install/manual)
- Flutter Android 环境配置：[https://docs.flutter.dev/platform-integration/android/setup](https://docs.flutter.dev/platform-integration/android/setup)
- Flutter iOS 环境配置：[https://docs.flutter.dev/platform-integration/ios/setup](https://docs.flutter.dev/platform-integration/ios/setup)
- Flutter Android Studio 配置：[https://docs.flutter.dev/tools/android-studio](https://docs.flutter.dev/tools/android-studio)
- Flutter VS Code 配置：[https://docs.flutter.dev/tools/vs-code](https://docs.flutter.dev/tools/vs-code)
- Android Studio：[https://developer.android.com/studio](https://developer.android.com/studio)
- Xcode：[https://developer.apple.com/xcode/](https://developer.apple.com/xcode/)
- CocoaPods：[https://guides.cocoapods.org/using/getting-started.html](https://guides.cocoapods.org/using/getting-started.html)
