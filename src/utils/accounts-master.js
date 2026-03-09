export const DEFAULT_ACCOUNTS = [
  // 資産 (Assets)
  { code: '1001', name: '現金', category: 'asset', description: '手元の現金' },
  { code: '1002', name: '普通預金', category: 'asset', description: '銀行口座' },
  { code: '1003', name: '電子マネー', category: 'asset', description: 'PayPay, LINE Payなど' },
  { code: '1004', name: 'クレジットカード', category: 'liability', description: '未払いのカード利用分' },

  // 収入 (Income)
  { code: '4001', name: '給与収入', category: 'income', description: '本業の給料' },
  { code: '4002', name: '賞与', category: 'income', description: 'ボーナス' },
  { code: '4003', name: '副業収入', category: 'income', description: '副業・雑所得' },
  { code: '4004', name: '臨時収入', category: 'income', description: 'お祝い金、還付金など' },
  { code: '4005', name: '利子・配当', category: 'income', description: '預金利息や株の配当' },

  // 支出 (Expenses)
  { code: '5001', name: '食費', category: 'expense', description: '食料品、外食' },
  { code: '5002', name: '日用品', category: 'expense', description: '消耗品、雑貨' },
  { code: '5003', name: '住居費', category: 'expense', description: '家賃、住宅ローン、共益費' },
  { code: '5004', name: '水道光熱費', category: 'expense', description: '電気、ガス、水道' },
  { code: '5005', name: '通信費', category: 'expense', description: '携帯電話、インターネット' },
  { code: '5006', name: '交通費', category: 'expense', description: '電車、バス、タクシー、ガソリン' },
  { code: '5007', name: '保険', category: 'expense', description: '生命保険、医療保険' },
  { code: '5008', name: '医療費', category: 'expense', description: '病院、薬代' },
  { code: '5009', name: '教育・教養', category: 'expense', description: '書籍、習い事、学費' },
  { code: '5010', name: '美容・衣服', category: 'expense', description: '服、美容室、化粧品' },
  { code: '5011', name: '趣味・娯楽', category: 'expense', description: '旅行、映画、遊び' },
  { code: '5012', name: '交際費', category: 'expense', description: 'プレゼント、飲み会' },
  { code: '5013', name: 'サブスクリプション', category: 'expense', description: 'Netflix, Spotifyなど' },
  { code: '5014', name: '税金・社会保険', category: 'expense', description: '住民税、年金など' },
  { code: '5015', name: '特別な支出', category: 'expense', description: '家具、家電、冠婚葬祭' },
  { code: '5099', name: 'その他支出', category: 'expense', description: '分類不能な支出' }
];

export const ACCOUNT_CATEGORIES = [
  { id: 'asset', name: '資産', color: '#10b981' },
  { id: 'liability', name: '負債', color: '#f43f5e' },
  { id: 'income', name: '収入', color: '#3b82f6' },
  { id: 'expense', name: '支出', color: '#f59e0b' }
];

// カテゴリ名からバッジクラスを取得
export function getCategoryBadgeClass(category) {
  const map = {
    asset: 'badge-asset',
    liability: 'badge-liability',
    equity: 'badge-equity',
    income: 'badge-income',
    revenue: 'badge-income', // 互換性のため
    expense: 'badge-expense',
  };
  return map[category] || '';
}

// カテゴリ名の日本語表記
export function getCategoryLabel(category) {
  const map = {
    asset: '資産',
    liability: '負債',
    equity: '純資産',
    income: '収入',
    revenue: '収入', // 互換性のため
    expense: '支出',
  };
  return map[category] || category;
}
