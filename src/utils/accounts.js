export const DEFAULT_ACCOUNT_ID = 'default-account';

export const DEFAULT_ACCOUNT = {
  id: DEFAULT_ACCOUNT_ID,
  name: '기본 계좌',
  openingBalance: 0,
};

export const getAccountId = (transaction) => transaction.accountId || DEFAULT_ACCOUNT_ID;

export function getAccountBalance(account, transactions) {
  return transactions.reduce((balance, transaction) => {
    const amount = Number(transaction.amount) || 0;
    if (transaction.type === 'transfer') {
      if (getAccountId(transaction) === account.id) balance -= amount;
      if (transaction.toAccountId === account.id) balance += amount;
    } else if (getAccountId(transaction) === account.id) {
      balance += transaction.type === 'income' ? amount : -amount;
    }
    return balance;
  }, Number(account.openingBalance) || 0);
}

export function normalizeFinanceData(data) {
  const savedAccounts = Array.isArray(data?.accounts) ? data.accounts : [];
  const accounts = savedAccounts.some((account) => account.id === DEFAULT_ACCOUNT_ID)
    ? savedAccounts
    : [DEFAULT_ACCOUNT, ...savedAccounts];
  const accountIds = new Set(accounts.map((account) => account.id));
  const transactions = (Array.isArray(data?.transactions) ? data.transactions : []).map((transaction) => ({
    ...transaction,
    accountId: accountIds.has(transaction.accountId) ? transaction.accountId : DEFAULT_ACCOUNT_ID,
    source: transaction.source || (transaction.id?.startsWith('txn_csv_') ? 'csv' : 'manual'),
  }));
  return { accounts, transactions };
}
