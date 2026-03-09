-- KURONYLAB 家計簿 (Kakeibo) 用 Supabase 初期設定 SQL
-- このSQLをSupabaseのSQL Editorに貼り付けて実行してください。

-- 1. 取引テーブル (transactions)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  year_month TEXT NOT NULL, -- YYYY-MM形式
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  amount BIGINT NOT NULL,
  description TEXT,
  partner TEXT,
  tags TEXT,
  subscription_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 自動記帳設定テーブル (subscriptions)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_month INTEGER NOT NULL,
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  amount BIGINT NOT NULL,
  description TEXT NOT NULL,
  partner TEXT,
  tags TEXT,
  start_month TEXT NOT NULL,
  end_month TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 設定テーブル (settings)
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT, -- 家計簿タイトル
  taxpayer_name TEXT, -- 表示名
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Row Level Security (RLS) の設定
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成 (再実行可能なようにDROPしてからCREATE)
DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;
CREATE POLICY "Users can manage their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON subscriptions;
CREATE POLICY "Users can manage their own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own settings" ON settings;
CREATE POLICY "Users can manage their own settings" ON settings
  FOR ALL USING (auth.uid() = user_id);
