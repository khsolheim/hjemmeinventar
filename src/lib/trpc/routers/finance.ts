import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'

export const financeRouter = createTRPCRouter({
  // Get budget data
  getBudgetData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock budget data
      const budgetData = {
        totalBudget: 25000,
        categories: [
          {
            id: 'food',
            name: 'Mat og Drikke',
            description: 'Dagligvare og restaurant',
            spent: 4500,
            budget: 6000,
            icon: 'Utensils'
          },
          {
            id: 'transport',
            name: 'Transport',
            description: 'Buss, tog og bensin',
            spent: 2800,
            budget: 3000,
            icon: 'Car'
          },
          {
            id: 'entertainment',
            name: 'Underholdning',
            description: 'Kino, konserter og hobby',
            spent: 1200,
            budget: 2000,
            icon: 'Music'
          },
          {
            id: 'utilities',
            name: 'Husholdning',
            description: 'Strøm, vann og internett',
            spent: 3500,
            budget: 4000,
            icon: 'Home'
          }
        ],
        budgetAnalytics: [
          {
            id: 'spending_trend',
            name: 'Spending Trend',
            value: '+12%',
            icon: 'TrendingUp'
          },
          {
            id: 'budget_utilization',
            name: 'Budget Utilization',
            value: '68%',
            icon: 'BarChart3'
          },
          {
            id: 'savings_rate',
            name: 'Savings Rate',
            value: '32%',
            icon: 'PiggyBank'
          },
          {
            id: 'monthly_average',
            name: 'Monthly Average',
            value: '22,500 kr',
            icon: 'Calendar'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'FINANCE_BUDGET_VIEWED',
          description: 'Viewed budget data',
          metadata: { totalBudget: budgetData.totalBudget }
        }
      })

      return budgetData
    }),

  // Get expenses data
  getExpensesData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock expenses data
      const expensesData = {
        totalExpenses: 12000,
        recentExpenses: [
          {
            id: 'expense_1',
            description: 'Dagligvare på Rema 1000',
            category: 'Mat og Drikke',
            amount: 450,
            date: '2024-01-15',
            paymentMethod: 'Kort',
            status: 'paid',
            icon: 'Receipt'
          },
          {
            id: 'expense_2',
            description: 'Bussbillett månedskort',
            category: 'Transport',
            amount: 850,
            date: '2024-01-14',
            paymentMethod: 'Kort',
            status: 'paid',
            icon: 'Car'
          },
          {
            id: 'expense_3',
            description: 'Kino - Oppenheimer',
            category: 'Underholdning',
            amount: 180,
            date: '2024-01-13',
            paymentMethod: 'Kontanter',
            status: 'paid',
            icon: 'Video'
          },
          {
            id: 'expense_4',
            description: 'Strømregning',
            category: 'Husholdning',
            amount: 1200,
            date: '2024-01-12',
            paymentMethod: 'Faktura',
            status: 'pending',
            icon: 'Zap'
          }
        ],
        expenseAnalytics: [
          {
            id: 'category_distribution',
            name: 'Category Distribution',
            value: 'Mat: 38%, Transport: 24%, Underholdning: 10%, Husholdning: 28%',
            percentage: 100
          },
          {
            id: 'payment_methods',
            name: 'Payment Methods',
            value: 'Kort: 65%, Kontanter: 15%, Faktura: 20%',
            percentage: 100
          },
          {
            id: 'daily_average',
            name: 'Daily Average',
            value: '800 kr',
            percentage: 75
          },
          {
            id: 'monthly_trend',
            name: 'Monthly Trend',
            value: '+8% vs last month',
            percentage: 80
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'FINANCE_EXPENSES_VIEWED',
          description: 'Viewed expenses data',
          metadata: { totalExpenses: expensesData.totalExpenses }
        }
      })

      return expensesData
    }),

  // Get investments data
  getInvestmentsData: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock investments data
      const investmentsData = {
        totalValue: 125000,
        investments: [
          {
            id: 'investment_1',
            name: 'DNB Teknologi',
            type: 'Aksjefond',
            symbol: 'DNBTEK',
            currentValue: 45000,
            performance: 12.5,
            icon: 'TrendingUp'
          },
          {
            id: 'investment_2',
            name: 'KLP AksjeNorge',
            type: 'Indeksfond',
            symbol: 'KLPNOR',
            currentValue: 38000,
            performance: 8.2,
            icon: 'BarChart3'
          },
          {
            id: 'investment_3',
            name: 'Storebrand Global',
            type: 'Aksjefond',
            symbol: 'STBGLB',
            currentValue: 32000,
            performance: -2.1,
            icon: 'Globe'
          },
          {
            id: 'investment_4',
            name: 'SpareBank 1',
            type: 'Aksjer',
            symbol: 'SPAR',
            currentValue: 10000,
            performance: 5.8,
            icon: 'Building'
          }
        ],
        investmentAnalytics: [
          {
            id: 'total_return',
            name: 'Total Return',
            value: '+6.1%',
            icon: 'TrendingUp'
          },
          {
            id: 'portfolio_diversity',
            name: 'Portfolio Diversity',
            value: '4 assets',
            icon: 'PieChart'
          },
          {
            id: 'risk_level',
            name: 'Risk Level',
            value: 'Medium',
            icon: 'Shield'
          },
          {
            id: 'annual_growth',
            name: 'Annual Growth',
            value: '+8.5%',
            icon: 'Target'
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'FINANCE_INVESTMENTS_VIEWED',
          description: 'Viewed investments data',
          metadata: { totalValue: investmentsData.totalValue }
        }
      })

      return investmentsData
    }),

  // Get finance settings
  getFinanceSettings: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock finance settings
      const settingsData = {
        totalSavings: 75000,
        settings: [
          {
            id: 'finance_enabled',
            key: 'financeEnabled',
            name: 'Finance Tracking',
            enabled: true,
            icon: 'DollarSign'
          },
          {
            id: 'budget_alerts',
            key: 'budgetAlerts',
            name: 'Budget Alerts',
            enabled: true,
            icon: 'Bell'
          },
          {
            id: 'expense_reminders',
            key: 'expenseReminders',
            name: 'Expense Reminders',
            enabled: true,
            icon: 'Clock'
          },
          {
            id: 'investment_updates',
            key: 'investmentUpdates',
            name: 'Investment Updates',
            enabled: false,
            icon: 'TrendingUp'
          }
        ],
        financialGoals: [
          {
            id: 'emergency_fund',
            name: 'Emergency Fund',
            current: 25000,
            target: 50000
          },
          {
            id: 'vacation_savings',
            name: 'Vacation Savings',
            current: 15000,
            target: 30000
          },
          {
            id: 'house_down_payment',
            name: 'House Down Payment',
            current: 35000,
            target: 500000
          },
          {
            id: 'retirement_savings',
            name: 'Retirement Savings',
            current: 0,
            target: 2000000
          }
        ]
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'FINANCE_SETTINGS_VIEWED',
          description: 'Viewed finance settings',
          metadata: { totalSavings: settingsData.totalSavings }
        }
      })

      return settingsData
    }),

  // Add expense
  addExpense: protectedProcedure
    .input(z.object({
      description: z.string(),
      amount: z.number(),
      category: z.string(),
      paymentMethod: z.string(),
      date: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'FINANCE_EXPENSE_ADDED',
          description: `Added expense: ${input.description}`,
          metadata: { amount: input.amount, category: input.category }
        }
      })

      return { success: true, message: 'Expense added successfully' }
    }),

  // Update budget
  updateBudget: protectedProcedure
    .input(z.object({
      budgetId: z.string(),
      amount: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'FINANCE_BUDGET_UPDATED',
          description: `Updated budget: ${input.budgetId}`,
          metadata: { amount: input.amount }
        }
      })

      return { success: true, message: 'Budget updated successfully' }
    }),

  // Add investment
  addInvestment: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.string(),
      symbol: z.string(),
      amount: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'FINANCE_INVESTMENT_ADDED',
          description: `Added investment: ${input.name}`,
          metadata: { amount: input.amount, type: input.type }
        }
      })

      return { success: true, message: 'Investment added successfully' }
    }),

  // Update finance settings
  updateSettings: protectedProcedure
    .input(z.object({
      financeEnabled: z.boolean().optional(),
      budgetAlerts: z.boolean().optional(),
      expenseReminders: z.boolean().optional(),
      investmentUpdates: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'FINANCE_SETTINGS_UPDATED',
          description: 'Updated finance settings',
          metadata: input
        }
      })

      return { success: true, message: 'Settings updated successfully' }
    }),

  // Get finance statistics
  getFinanceStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock finance statistics
      const stats = {
        totalExpenses: 12000,
        totalBudget: 25000,
        totalInvestments: 125000,
        totalSavings: 75000,
        monthlyAverage: 22500,
        savingsRate: 32
      }

      // Log activity
      await ctx.db.activity.create({
        data: {
          userId: ctx.user.id,
          type: 'FINANCE_STATS_VIEWED',
          description: 'Viewed finance statistics',
          metadata: stats
        }
      })

      return stats
    })
})
