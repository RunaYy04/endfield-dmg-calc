import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

// 初始化 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 自动处理百分数
 * 处理空值、空格及 "N/a" 等异常占位符
 * 过滤非数字字符
 */
function parseNumber(value) {
  if (!value || value.trim().toLowerCase() === 'n/a') return 0;
  const strVal = String(value).trim();

  // 处理百分比格式
  if (strVal.endsWith('%')) {
    const num = Number(strVal.replace('%', ''));
    return isNaN(num) ? 0 : num / 100;
  }

  const num = Number(strVal);
  return isNaN(num) ? 0 : num;
}

function extractModifiers(row) {
  return {
    physBonus: parseNumber(row['物理加成']),
    thermalBonus: parseNumber(row['灼热加成']),
    electroBonus: parseNumber(row['电磁加成']),
    cryoBonus: parseNumber(row['寒冷加成']),
    natureBonus: parseNumber(row['自然加成']),

    normalAtkBonus: parseNumber(row['普攻加成']),
    skillBonus: parseNumber(row['战技加成']),
    comboBonus: parseNumber(row['连携技加成']),
    ultimateBonus: parseNumber(row['终结技加成']),

    staggerBonus: parseNumber(row['失衡加成']),
    originiumArtBonus: parseNumber(row['源石技艺强度']) || parseNumber(row['源石技艺加成']),


    dmgBonus: parseNumber(row['伤害加成']) || parseNumber(row['增伤区']),
    amplification: parseNumber(row['增幅加成']) || parseNumber(row['增幅区']),
    vulnerability: parseNumber(row['易伤加成']) || parseNumber(row['易伤区']),
    fragility: parseNumber(row['脆弱加成']) || parseNumber(row['脆弱区']),
    staggerVuln: parseNumber(row['失衡易伤加成']),
    comboMultiplier: parseNumber(row['连击加成']),
    specialMultiplier: parseNumber(row['特殊加成']),
    resistancePen: parseNumber(row['抗性']),

    atkPercentBonus: parseNumber(row['攻击力加成']) || parseNumber(row['百分比攻击']) || parseNumber(row['攻击加成']),
    flatAttack: parseNumber(row['固定攻击']) || parseNumber(row['额外固定攻击'])
  };
}

/**
 * @param inputFileName  输入文件名
 * @param outputFileName 输出文件名
 * @param formatRow      定义组装JSON
 */
function parseCSV(inputFileName, outputFileName, formatRow) {
  const results = [];
  const inputPath = path.join(__dirname, '../raw-data', inputFileName);
  const outputPath = path.join(__dirname, '../src/data', outputFileName);

  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  if (!fs.existsSync(inputPath)) {
    console.warn(`[跳过] 未找到文件: ${inputPath}`);
    return;
  }

  fs.createReadStream(inputPath)
    .pipe(csv())
    .on('data', (data) => {
      const keys = Object.keys(data);
      if (keys.length === 0) return;
      const name = String(data[keys[0]] || '').trim();
      if (name && !name.includes('期望') && name !== '0') {
        results.push(formatRow(data, name));
      }
    })
    .on('end', () => {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
      console.log(`✅ 成功转换: ${inputFileName} -> ${outputFileName} (${results.length}条数据)`);
    });
}

parseCSV('干员属性.csv', 'operators.json', (row, name) => ({
  name,
  baseAttack: parseNumber(row['攻击']),
  strength: parseNumber(row['力量']),
  agility: parseNumber(row['敏捷']),
  intelligence: parseNumber(row['智识']),
  willpower: parseNumber(row['意志']),
  critRate: parseNumber(row['暴击']),
  critDamage: parseNumber(row['暴击伤害']),

  mainAttributeTag: row['主能力'],//如智识
  subAttributeTag: row['副能力一'],
  
  specialStatBonus: parseNumber(row['特殊能力值加成']),
  ...extractModifiers(row)
}));

const parseEquipment = (row, name) => ({
  name,
  baseAttack: parseNumber(row['攻击']),
  strength: parseNumber(row['力量']),
  agility: parseNumber(row['敏捷']),
  intelligence: parseNumber(row['智识']),
  willpower: parseNumber(row['意志']),
  critRate: parseNumber(row['暴击']),
  critDamage: parseNumber(row['暴击伤害']),
  mainAttribute: parseNumber(row['主属性']),//百分比
  subAttribute: parseNumber(row['副属性']),
  mainAttributeFlat: parseNumber(row['主能力']), // 如楔子132主能力
  subAttributeFlat: parseNumber(row['副能力']),

  ...extractModifiers(row)
});

parseCSV('武器属性.csv', 'weapons.json', parseEquipment);
parseCSV('护甲属性.csv', 'armors.json', parseEquipment);
parseCSV('护手属性.csv', 'gloves.json', parseEquipment);
parseCSV('配件属性.csv', 'accessories.json', parseEquipment);
parseCSV('套装属性.csv', 'sets.json', parseEquipment);
parseCSV('食物属性.csv', 'foods.json', parseEquipment);

parseCSV('增益属性.csv', 'buffs.json', (row, name) => ({
  name,
  critRate: parseNumber(row['额外暴击']),
  critDamage: parseNumber(row['额外暴击伤害']),
  statPercentBonus: parseNumber(row['能力加成']),
  ...extractModifiers(row)
}));

parseCSV('技能属性.csv', 'skills.json', (row, name) => {

  const rawTags = row['技能类型'] || '无';
  const tags = rawTags.split(',').map(tag => tag.trim()).filter(t => t !== '无');

  return {
    name,
    multiplier: parseNumber(row['倍率']),
    extraCritRate: parseNumber(row['额外暴击']),
    extraCritDamage: parseNumber(row['额外暴击伤害']),
    isStagger: parseNumber(row['失衡']) === 1,
    elemType: row['伤害加成'],
    skillType: row['技能类型'],
    ...extractModifiers(row)
  };
});