import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  PiggyBank,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useFinanceStore from '../store/financeStore';

const PIE_COLORS = ['#7667f4', '#4f9cf9', '#17b26a', '#f5b544', '#ff7657', '#a78bfa'];

const formatWon = (value) => `${Math.round(value).toLocaleString('ko-KR')}원`;

const formatCompactWon = (value) => {
  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만`;
  }
  return `${Math.round(value).toLocaleString('ko-KR')}`;
};

const formatDate = (date) => new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
}).format(new Date(`${date}T00:00:00`));

function MetricCard({ icon: Icon, label, value, meta, tone, positive }) {
  return (
    <article className="metric-card" style={{ '--metric-color': tone.color, '--metric-bg': tone.background, '--metric-glow': tone.glow }}>
      <div className="metric-topline">
        <span className="metric-label">{label}</span>
        <span className="metric-icon"><Icon size={17} strokeWidth={2} /></span>
      </div>
      <p className="metric-value">{value}</p>
      <span className={`metric-meta${positive === true ? ' positive' : positive === false ? ' negative' : ''}`}>
        {positive === true && <ArrowUpRight size={13} />}
        {positive === false && <ArrowDownRight size={13} />}
        {meta}
      </span>
    </article>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}

function ActivityItem({ transaction }) {
  const isIncome = transaction.type === 'income';
  return (
    <li className="activity-item">
      <span className="activity-icon">
        {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      </span>
      <div className="activity-content">
        <strong>{transaction.memo || transaction.category}</strong>
        <span>{transaction.category} · {formatDate(transaction.date)}</span>
      </div>
      <span className={`activity-amount ${isIncome ? 'income' : 'expense'}`}>
        {isIncome ? '+' : '-'}{formatWon(transaction.amount)}
      </span>
    </li>
  );
}

export default function Dashboard() {
  const transactions = useFinanceStore((state) => state.transactions);
  const goals = useFinanceStore((state) => state.goals);

  const analytics = useMemo(() => {
    const monthlyMap = new Map();
    const categoryMap = new Map();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount) || 0;
      const month = transaction.date.slice(0, 7);
      const monthData = monthlyMap.get(month) || { month, income: 0, expense: 0 };

      if (transaction.type === 'income') {
        totalIncome += amount;
        monthData.income += amount;
      } else {
        totalExpense += amount;
        monthData.expense += amount;
        categoryMap.set(transaction.category, (categoryMap.get(transaction.category) || 0) + amount);
      }

      monthlyMap.set(month, monthData);
    });

    const monthlyData = [...monthlyMap.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((item) => ({ ...item, name: `${Number(item.month.slice(5))}월` }));

    const categoryData = [...categoryMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      totalIncome,
      totalExpense,
      currentAsset: totalIncome - totalExpense,
      monthlyData,
      categoryData,
      recentTransactions: transactions.slice(0, 5),
    };
  }, [transactions]);

  const savingsRate = analytics.totalIncome > 0
    ? Math.max(0, Math.round(((analytics.totalIncome - analytics.totalExpense) / analytics.totalIncome) * 100))
    : 0;
  const topCategory = analytics.categoryData[0];
  const activeGoal = goals
    .filter((goal) => goal.currentAmount < goal.targetAmount)
    .sort((a, b) => b.currentAmount / b.targetAmount - a.currentAmount / a.targetAmount)[0];
  const goalProgress = activeGoal ? Math.min(Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100), 100) : 0;
  const todayLabel = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="page-shell">
      <header className="page-header dashboard-page-header">
        <div>
          <p className="page-kicker"><Sparkles size={13} /> Financial cockpit</p>
          <h1 className="page-title">좋은 흐름이 쌓이고 있어요.</h1>
          <p className="page-subtitle">오늘의 자산 상태와 소비 리듬을 차분하게 확인해보세요.</p>
        </div>
        <div className="header-actions">
          <span className="header-date"><CalendarDays size={14} /> {todayLabel}</span>
          <Link to="/transactions" className="btn-accent"><Plus size={16} /> 거래 추가</Link>
        </div>
      </header>

      <section className="dashboard-hero" aria-label="자산 요약">
        <div className="hero-copy">
          <span className="hero-eyebrow"><Activity size={13} /> Live money pulse</span>
          <h2 className="hero-title">지금 내 자산은<br /><strong>{formatWon(analytics.currentAsset)}</strong>입니다.</h2>
          <p>수입과 지출의 흐름을 바탕으로 계산한 누적 자산입니다. 작은 습관이 다음 달의 선택을 바꿔요.</p>
          <div className="hero-actions">
            <Link to="/statistics" className="btn-primary">전체 분석 보기 <ChevronRight size={15} /></Link>
            <Link to="/goals" className="btn-ghost">목표 확인</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orbit">
            <div className="hero-orbit-inner">
              <span>저축률</span>
              <strong>{savingsRate}%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-4" aria-label="핵심 지표">
        <MetricCard
          icon={WalletCards}
          label="현재 자산"
          value={formatWon(analytics.currentAsset)}
          meta="누적 수입 - 누적 지출"
          tone={{ color: 'var(--accent-purple)', background: 'rgba(118, 103, 244, .12)', glow: 'rgba(118, 103, 244, .12)' }}
        />
        <MetricCard
          icon={TrendingUp}
          label="누적 수입"
          value={formatWon(analytics.totalIncome)}
          meta="전체 기간 기준"
          tone={{ color: 'var(--accent-green)', background: 'rgba(23, 178, 106, .12)', glow: 'rgba(23, 178, 106, .1)' }}
          positive={analytics.totalIncome > 0}
        />
        <MetricCard
          icon={CircleDollarSign}
          label="누적 지출"
          value={formatWon(analytics.totalExpense)}
          meta={topCategory ? `가장 큰 지출 · ${topCategory.name}` : '아직 지출 기록이 없어요'}
          tone={{ color: 'var(--accent-orange)', background: 'rgba(255, 118, 87, .12)', glow: 'rgba(255, 118, 87, .1)' }}
        />
        <MetricCard
          icon={PiggyBank}
          label="저축률"
          value={`${savingsRate}%`}
          meta={savingsRate >= 30 ? '좋은 리듬을 유지하고 있어요' : '수입과 지출을 함께 관리해보세요'}
          tone={{ color: 'var(--accent-yellow)', background: 'rgba(245, 181, 68, .14)', glow: 'rgba(245, 181, 68, .1)' }}
          positive={savingsRate >= 30}
        />
      </section>

      <section className="dashboard-grid">
        <article className="card chart-card">
          <div className="card-header">
            <div>
              <h2 className="card-heading">월별 현금 흐름</h2>
              <p className="card-caption">최근 6개월의 수입과 지출을 비교해요.</p>
            </div>
            <span className="card-badge">IN / OUT</span>
          </div>
          {analytics.monthlyData.length > 0 ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyData} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatCompactWon} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
                  <Tooltip
                    cursor={{ fill: 'rgba(118, 103, 244, .06)' }}
                    contentStyle={{ color: 'var(--text-primary)', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, boxShadow: 'var(--card-shadow)' }}
                    formatter={(value) => formatWon(value)}
                  />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 11, paddingTop: 12 }} />
                  <Bar dataKey="income" name="수입" fill="var(--accent-purple)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" name="지출" fill="var(--accent-orange)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty"><EmptyState title="아직 현금 흐름이 없어요" description="거래를 추가하면 차트가 채워집니다." /></div>
          )}
        </article>

        <article className="card chart-card">
          <div className="card-header">
            <div>
              <h2 className="card-heading">지출 포트폴리오</h2>
              <p className="card-caption">카테고리별 소비 비중입니다.</p>
            </div>
            <span className="card-badge">SPEND</span>
          </div>
          {analytics.categoryData.length > 0 ? (
            <>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.categoryData} cx="50%" cy="50%" innerRadius={76} outerRadius={102} paddingAngle={4} dataKey="value" stroke="none">
                      {analytics.categoryData.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ color: 'var(--text-primary)', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, boxShadow: 'var(--card-shadow)' }}
                      formatter={(value) => formatWon(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center"><span>총 지출</span><strong>{formatCompactWon(analytics.totalExpense)}원</strong></div>
              </div>
              <div className="category-legend">
                {analytics.categoryData.slice(0, 4).map((category, index) => (
                  <span key={category.name}><i style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />{category.name}<strong>{Math.round((category.value / analytics.totalExpense) * 100)}%</strong></span>
                ))}
              </div>
            </>
          ) : (
            <div className="chart-empty"><EmptyState title="지출 데이터가 없어요" description="소비가 쌓이면 비중을 보여드릴게요." /></div>
          )}
        </article>
      </section>

      <section className="bottom-grid">
        <article className="card">
          <div className="card-header">
            <div>
              <h2 className="card-heading">최근 활동</h2>
              <p className="card-caption">가장 최근에 기록한 거래입니다.</p>
            </div>
            <Link to="/transactions" className="section-link">전체 보기 <ChevronRight size={14} /></Link>
          </div>
          {analytics.recentTransactions.length > 0 ? (
            <ul className="activity-list">{analytics.recentTransactions.map((transaction) => <ActivityItem key={transaction.id} transaction={transaction} />)}</ul>
          ) : (
            <EmptyState title="첫 거래를 기록해보세요" description="거래 내역이 이곳에 최신순으로 표시됩니다." />
          )}
        </article>

        <article className="card insight-card">
          <div className="insight-content">
            <span className="insight-icon"><Sparkles size={18} /></span>
            <h2 className="insight-title">이번 달의 한 줄 인사이트</h2>
            <p className="insight-text">
              {topCategory
                ? `${topCategory.name} 카테고리가 현재 가장 큰 지출이에요. 다음 소비를 기록할 때 한 번 더 우선순위를 생각해보세요.`
                : '거래를 몇 건만 기록해도 나만의 소비 패턴을 발견할 수 있어요.'}
            </p>
            <div className="insight-stat">
              <span>{activeGoal ? `${activeGoal.name} 진행률` : '관리 중인 목표'}</span>
              <strong>{activeGoal ? `${goalProgress}%` : goals.length > 0 ? `${goals.length}개` : '시작 전'}</strong>
            </div>
            <Link to={activeGoal ? '/goals' : '/transactions'} className="insight-link">
              {activeGoal ? '목표 업데이트하기' : '첫 거래 추가하기'} <ChevronRight size={14} />
            </Link>
          </div>
          <Target className="insight-watermark" size={120} />
        </article>
      </section>
    </div>
  );
}
