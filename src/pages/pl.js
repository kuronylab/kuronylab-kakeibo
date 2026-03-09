import { store } from '../store.js';
import { db } from '../db.js';
import { formatCurrency } from '../utils/format.js';

export function renderPL() {
  const container = document.createElement('div');
  container.className = 'page-section animate-fade-in';

  container.innerHTML = `
    <div class="card mb-lg">
      <div class="card-header">
        <h3 class="card-title">収支レポート - ${store.state.currentYear}年度</h3>
        <button class="btn btn-secondary btn-sm" id="btn-export-pl">CSVエクスポート</button>
      </div>
      
      <div class="statement-section" id="pl-content">
        <div class="text-center text-muted" style="padding: 3rem;">計算中...</div>
      </div>
    </div>
  `;

  return container;
}

export function onPLMount() {
  if (window._currentUnsubscribe) window._currentUnsubscribe();

  const unsubscribe = store.subscribe(() => {
    updatePLUI();
  });
  window._currentUnsubscribe = unsubscribe;
  const exportBtn = document.getElementById('btn-export-pl');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const { currentYear, accounts } = store.state;
      const txs = await db.getTransactionsByYear(currentYear);
      const { exportToCSV } = await import('../utils/export.js');

      let salesAmount = 0;
      let costOfSales = 0;
      const expenses = {};

      accounts.filter(a => a.category === 'expense' && a.code !== '5001').forEach(acc => {
        expenses[acc.code] = { name: acc.name, amount: 0 };
      });

      txs.forEach(tx => {
        const debit = store.getAccountByCode(tx.debitAccount);
        const credit = store.getAccountByCode(tx.creditAccount);

        if (credit && credit.category === 'income') salesAmount += tx.amount;
        if (debit && debit.category === 'income') salesAmount -= tx.amount;
        if (debit && debit.code === '5001') costOfSales += tx.amount;
        if (credit && credit.code === '5001') costOfSales -= tx.amount;

        if (debit && debit.category === 'expense' && debit.code !== '5001') {
          if (expenses[debit.code]) expenses[debit.code].amount += tx.amount;
        }
        if (credit && credit.category === 'expense' && credit.code !== '5001') {
          if (expenses[credit.code]) expenses[credit.code].amount -= tx.amount;
        }
      });

      const grossProfit = salesAmount - costOfSales;
      const totalExpense = Object.values(expenses).reduce((sum, exp) => sum + exp.amount, 0);
      const operatingProfit = grossProfit - totalExpense;

      const activeExpenses = Object.values(expenses)
        .filter(exp => exp.amount !== 0)
        .sort((a, b) => b.amount - a.amount);

      const data = [
        { '項目': 'Ⅰ 収入合計', '金額': salesAmount },
        { '項目': 'Ⅱ 特別な支出 / 仕入', '金額': costOfSales },
        { '項目': '差引利益', '金額': grossProfit },
        { '項目': 'Ⅲ 常時支出（生活費・固定費等）', '金額': '' }
      ];

      activeExpenses.forEach(exp => {
        data.push({ '項目': `  ${exp.name}`, '金額': exp.amount });
      });

      data.push({ '項目': '支出合計', '金額': totalExpense });
      data.push({ '項目': '当期純収支', '金額': operatingProfit });

      exportToCSV(data, `収支レポート_${currentYear}年`);
    });
  }
}

async function updatePLUI() {
  const { currentYear, accounts } = store.state;
  const content = document.getElementById('pl-content');
  if (!content) return;

  const txs = await db.getTransactionsByYear(currentYear);

  // 売上・費用の集計
  let salesAmount = 0;       // 売上（収益）
  let costOfSales = 0;       // 売上原価（仕入）
  const expenses = {};       // 販管費（その他費用）

  // 経費科目の初期化
  accounts.filter(a => a.category === 'expense' && a.code !== '5001').forEach(acc => {
    expenses[acc.code] = { name: acc.name, amount: 0 };
  });

  txs.forEach(tx => {
    const debit = store.getAccountByCode(tx.debitAccount);
    const credit = store.getAccountByCode(tx.creditAccount);

    // 収入の計上 (貸方が収入)
    if (credit && credit.category === 'income') {
      salesAmount += tx.amount;
    }
    // 収入の取消等 (借方が収入)
    if (debit && debit.category === 'income') {
      salesAmount -= tx.amount;
    }

    // 仕入（売上原価）の計上 (通常は5001:仕入高)
    if (debit && debit.code === '5001') costOfSales += tx.amount;
    if (credit && credit.code === '5001') costOfSales -= tx.amount;

    // その他費用の計上
    if (debit && debit.category === 'expense' && debit.code !== '5001') {
      if (expenses[debit.code]) expenses[debit.code].amount += tx.amount;
    }
    if (credit && credit.category === 'expense' && credit.code !== '5001') {
      if (expenses[credit.code]) expenses[credit.code].amount -= tx.amount;
    }
  });

  // 売上総利益（粗利）= 売上高 - 売上原価
  const grossProfit = salesAmount - costOfSales;

  // 販管費合計
  const totalExpense = Object.values(expenses).reduce((sum, exp) => sum + exp.amount, 0);

  // 営業利益（事業所得）= 売上総利益 - 販管費
  const operatingProfit = grossProfit - totalExpense;

  // 発生している経費項目のみを抽出
  const activeExpenses = Object.values(expenses)
    .filter(exp => exp.amount !== 0)
    .sort((a, b) => b.amount - a.amount); // 金額が大きい順

  const expensesHtml = activeExpenses.map(exp => `
    <div class="statement-row indent">
      <div class="statement-label">${exp.name}</div>
      <div class="statement-amount">${formatCurrency(exp.amount)}</div>
    </div>
  `).join('');

  const html = `
    <!-- 収入 -->
    <div class="statement-row">
      <div class="statement-label font-bold text-primary">Ⅰ 収入合計</div>
      <div class="statement-amount text-emerald">${formatCurrency(salesAmount)}</div>
    </div>
    
    <!-- 特別な支出 -->
    <div class="statement-row mt-md">
      <div class="statement-label font-bold text-primary">Ⅱ 特別な支出（大型購入など）</div>
      <div class="statement-amount text-rose">${formatCurrency(costOfSales)}</div>
    </div>
    
    <!-- 収支 -->
    <div class="statement-row total mb-md">
      <div class="statement-label font-bold text-primary">差引収支</div>
      <div class="statement-amount text-primary font-bold">${formatCurrency(grossProfit)}</div>
    </div>
    
    <!-- 生活費・固定費 -->
    <div class="statement-row mt-lg">
      <div class="statement-label font-bold text-primary">Ⅲ 生活費・固定費</div>
      <div class="statement-amount"></div>
    </div>
    ${expensesHtml || '<div class="statement-row indent text-muted">支出の計上はありません</div>'}
    <div class="statement-row total indent mt-0 mb-md">
      <div class="statement-label">支出合計</div>
      <div class="statement-amount text-rose font-bold">${formatCurrency(totalExpense)}</div>
    </div>
    
    <!-- 当期純収支 -->
    <div class="statement-row grand-total mt-xl">
      <div class="statement-label">今期の純収支</div>
      <div class="statement-amount">${formatCurrency(operatingProfit)}</div>
    </div>
  `;

  content.innerHTML = html;
}
