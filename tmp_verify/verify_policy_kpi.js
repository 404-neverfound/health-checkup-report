'use strict';
/**
 * 端到端验证：3.3.3 防护有效性 KPI 卡 + 表格隐藏逻辑
 *
 * 验证场景：
 *  场景1 total=0 且 total_component_count=0  → 两张卡、slot、两张表全部隐藏
 *  场景2 total>0 且 total_component_count=0  → 仅隐藏「涉及组件」卡 + 组件汇总表
 *  场景3 total=0 且 total_component_count>0  → 仅隐藏「策略检查项」卡 + 异常项明细表
 *  场景4 total>0 且 total_component_count>0  → 全部保留
 *
 * 运行：node tmp_verify/verify_policy_kpi.js
 */
const { renderTemplate } = require('../src/template_renderer');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'security-report-preview.html'), 'utf8');

const base = {
  projectBackground: { customerName: '验证客户', startDate: '2026-01-01', endDate: '2026-03-31', title: '安全体检报告' }
};

function sectionOf(out) {
  const i = out.indexOf('id="sec-protection-effectiveness"');
  const j = out.indexOf('id="sec-appendix"', i);
  return out.slice(i, j);
}

function check(label, policyStats, expectations) {
  const data = {
    ...base,
    protection_effectiveness: { policy_stats: policyStats }
  };
  const out = renderTemplate(html, data, {});
  const seg = sectionOf(out);
  const result = {
    '卡1(策略检查项)': seg.includes('data-field="protection_effectiveness.policy_stats.abnormal_count"'),
    '卡2(涉及组件)': seg.includes('data-field="protection_effectiveness.policy_stats.abnormal_component_count"'),
    'slot(图表插槽)': seg.includes('slot-component-check-rings'),
    '表1(组件汇总)': seg.includes('sr-component-summary-tbl'),
    '表2(异常明细)': seg.includes('sr-component-check-tbl'),
    '导语(保留)': seg.includes('评估期间')
  };
  const keys = Object.keys(expectations);
  const allPass = keys.every((k) => result[k] === expectations[k]);
  console.log(`\n=== ${label} ${allPass ? '✅ PASS' : '❌ FAIL'} ===`);
  for (const k of keys) {
    const got = result[k];
    const want = expectations[k];
    console.log(`  ${k}: 实际=${got ? '存在' : '隐藏'} 期望=${want ? '存在' : '隐藏'} ${got === want ? '✓' : '✗'}`);
  }
  return allPass;
}

let allOk = true;
allOk &= check('场景1 total=0, total_component_count=0 (都无)', {
  total: 0, total_component_count: 0, abnormal_count: 0, abnormal_component_count: 0
}, { '卡1(策略检查项)': false, '卡2(涉及组件)': false, 'slot(图表插槽)': false, '表1(组件汇总)': false, '表2(异常明细)': false, '导语(保留)': true });

allOk &= check('场景2 total=3947>0, total_component_count=0 (仅组件无)', {
  total: 3947, total_component_count: 0, abnormal_count: 3317, abnormal_component_count: 0
}, { '卡1(策略检查项)': true, '卡2(涉及组件)': false, 'slot(图表插槽)': true, '表1(组件汇总)': false, '表2(异常明细)': true, '导语(保留)': true });

allOk &= check('场景3 total=0, total_component_count=5>0 (仅检查项无)', {
  total: 0, total_component_count: 5, abnormal_count: 0, abnormal_component_count: 1
}, { '卡1(策略检查项)': false, '卡2(涉及组件)': true, 'slot(图表插槽)': true, '表1(组件汇总)': true, '表2(异常明细)': false, '导语(保留)': true });

allOk &= check('场景4 total=5, total_component_count=3 (都有)', {
  total: 5, total_component_count: 3, abnormal_count: 1, abnormal_component_count: 1
}, { '卡1(策略检查项)': true, '卡2(涉及组件)': true, 'slot(图表插槽)': true, '表1(组件汇总)': true, '表2(异常明细)': true, '导语(保留)': true });

console.log(`\n${allOk ? '✅ 全部场景通过' : '❌ 有场景失败'}`);
process.exit(allOk ? 0 : 1);
