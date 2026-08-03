'use strict';
/**
 * 渲染 4 种场景的完整 HTML 报告，输出到 tmp_verify/render-scenarios/ 目录
 *
 * 运行：node tmp_verify/render_scenarios.js
 */
const { renderTemplate } = require('../src/template_renderer');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'security-report-preview.html'), 'utf8');

const outDir = path.join(__dirname, 'render-scenarios');
fs.mkdirSync(outDir, { recursive: true });

const base = {
  projectBackground: { customerName: '验证客户', startDate: '2026-01-01', endDate: '2026-03-31', title: '安全体检报告' },
  // 补充渲染管线会用到的空结构，避免其他环节报错/漏字段
  riskOverview: { keyRisksAllHidden: false, keyRisksNotAllHidden: true },
  riskDetails: {},
  ops: {},
  copyright: {}
};

const scenarios = [
  {
    name: '场景1_都为零',
    data: {
      protection_effectiveness: {
        policy_stats: {
          total: 0,
          total_component_count: 0,
          abnormal_count: 0,
          abnormal_component_count: 0,
          abnormal_by_dev_type_bracket: ''
        }
      }
    }
  },
  {
    name: '场景2_仅组件为零',
    data: {
      protection_effectiveness: {
        policy_stats: {
          total: 3947,
          total_component_count: 0,
          abnormal_count: 3317,
          abnormal_component_count: 0,
          abnormal_by_dev_type_bracket: '（EDR 2242 个、AF 1048 个、SIP 27 个）'
        }
      }
    }
  },
  {
    name: '场景3_仅检查项为零',
    data: {
      protection_effectiveness: {
        policy_stats: {
          total: 0,
          total_component_count: 5,
          abnormal_count: 0,
          abnormal_component_count: 1,
          abnormal_by_dev_type_bracket: ''
        }
      }
    }
  },
  {
    name: '场景4_都有数据',
    data: {
      protection_effectiveness: {
        policy_stats: {
          total: 5,
          total_component_count: 3,
          abnormal_count: 1,
          abnormal_component_count: 1,
          abnormal_by_dev_type_bracket: '（EDR 1 个）'
        }
      }
    }
  }
];

for (const sc of scenarios) {
  const data = JSON.parse(JSON.stringify(base));
  data.protection_effectiveness = sc.data.protection_effectiveness;
  const out = renderTemplate(html, data, {});
  const filePath = path.join(outDir, `${sc.name}.html`);
  fs.writeFileSync(filePath, out, 'utf8');
  console.log('已生成:', filePath, `(${out.length} 字节)`);
}

console.log('\n完成，请在浏览器打开查看。');
