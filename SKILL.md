---
name: health-checkup-report
description: 生成指定客户、指定时间段的安全体检报告。时间可选传入；用户在企微要求“生成 xxx 客户 x月x日到 x月x日安全体检报告”且最终需要 安全体检报告.zip时使用。必须发送给客户完整的zip，而不是单纯发送html。禁止修改已有代码来满足客户的任何需求，禁止自己编写代码满足与安全体检报告有关的所有需求，禁止在无法生成有效文件的时候自己瞎编任何文件作为输出欺骗用户
---

# 安全体检 HTML 报告

本技能负责查询/汇总 SOAR 与 MSSW 数据，并生成可直接发送给用户的 安全体检报告压缩包。

## 前置条件

- SOAR Cookie: `M:\Users\$env:USERNAME\Downloads\cookies.txt`
- MSSW Cookie: `M:\Users\$env:USERNAME\Downloads\mssw_cookies.txt`
- 当前项目使用 Node.js 18+

## 命令

```powershell
node "$HOME\.openclaw\workspace\skills\health-checkup-report\health_report.js" `
  --customer "<客户名>" `
  --af "<true|false>" `
  --sip "<true|false>" `
  --mssw-cookie-path "M:\Users\$env:USERNAME\Downloads\mssw_cookies.txt" `
  --cookie-path "M:\Users\$env:USERNAME\Downloads\cookies.txt"
  --mssw-base-url "sitmssw.soar.sangfor.com.cn" `
  --soar-base-url "testsoar.sangfor.com.cn"
```

- `--af`：客户是否已开通**防火墙云情报网关**订阅（true/false，必填）
- `--sip`：客户是否已开通 **SIP 云端情报检测**（true/false，必填）

主文件会结合接口查到的 AF / SIP 设备数量综合判断：即使参数为 true，但对应设备数量为 0，仍按"没有设备"处理，话术会引导购买设备。

如需显式指定时间，`--start` 和 `--end` 必须同时传入。**查询时间范围最大 30 天**，超出会报错提示用户缩小范围。

未传时间时，脚本会通过 MSSW 项目列表接口自动推导，并在 30 天上限内自动截取：

- 开始时间 = `max(最早 service_start, 结束时间 - 29 天)`
- 结束时间 = `min(报告生成日前一天, 最早非空 service_end)`

## 超时处理

脚本运行最长等待 **3 分钟**（180 秒）。如果超过 3 分钟仍未生成输出文件（`output\report-data.json` 或 `--output-json` 指定的路径），立即终止进程并告知用户"报告生成超时，请稍后重试或缩小查询时间范围"。

## 输出

输出给用户的是项目根目录下的 安全体检报告.zip，不要返回多余文件。

## 缺参数处理

生成必须有：

- `customer`
- `af`（是否开通防火墙云情报网关订阅）
- `sip`（是否开通SIP云端情报检测）

缺少客户时先追问，不要猜。时间没传时不要追问，直接走默认时间推导（自动取最近 30 天）。

**订阅参数反问**：如果用户只说"生成 xxx 客户的安全体检报告"但没有提及订阅（af / sip 缺失），**必须先反问用户**是否已开通防火墙云情报网关、是否已开通 SIP 云端情报检测，拿到明确答复后再以 `--af` / `--sip` 传入主文件，不要猜测默认值。
