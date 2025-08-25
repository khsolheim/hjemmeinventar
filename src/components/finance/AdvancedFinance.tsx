'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  Receipt,
  Calendar,
  Settings,
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Shield,
  Lock,
  Unlock,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  FileText,
  Image,
  Video,
  Music,
  File,
  Folder,
  Database,
  Server,
  Cloud,
  Globe,
  MapPin,
  Navigation,
  Compass,
  MessageSquare,
  MessageCircle,
  Bell,
  Mail,
  Phone,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Bluetooth,
  Zap,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Search,
  Filter,
  Grid3x3,
  List,
  Layers,
  Crosshair,
  Aim,
  Magic,
  Launch,
  King,
  Victory,
  Prize,
  Favorite,
  Details,
  Error,
  Warning,
  Success,
  Update,
  Config,
  Goal,
  Fitness,
  Pulse
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface AdvancedFinanceProps {
  className?: string
}

export function AdvancedFinance({ className }: AdvancedFinanceProps) {
  const [selectedTab, setSelectedTab] = useState<'budget' | 'expenses' | 'investments' | 'settings'>('budget')
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [financeEnabled, setFinanceEnabled] = useState(true)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // Finance queries
  const budgetQuery = trpc.finance.getBudgetData.useQuery()
  const expensesQuery = trpc.finance.getExpensesData.useQuery()
  const investmentsQuery = trpc.finance.getInvestmentsData.useQuery()
  const settingsQuery = trpc.finance.getFinanceSettings.useQuery()

  const addExpenseMutation = trpc.finance.addExpense.useMutation()
  const updateBudgetMutation = trpc.finance.updateBudget.useMutation()
  const addInvestmentMutation = trpc.finance.addInvestment.useMutation()
  const updateSettingsMutation = trpc.finance.updateSettings.useMutation()

  const handleAddExpense = async (expenseData: any) => {
    try {
      setIsAddingExpense(true)
      haptic.selection()

      const result = await addExpenseMutation.mutateAsync(expenseData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to add expense:', error)
      haptic.error()
    } finally {
      setIsAddingExpense(false)
    }
  }

  const handleUpdateBudget = async (budgetId: string, amount: number) => {
    try {
      haptic.selection()

      const result = await updateBudgetMutation.mutateAsync({
        budgetId,
        amount
      })

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to update budget:', error)
      haptic.error()
    }
  }

  const handleAddInvestment = async (investmentData: any) => {
    try {
      haptic.selection()

      const result = await addInvestmentMutation.mutateAsync(investmentData)

      if (result.success) {
        haptic.success()
      } else {
        haptic.error()
      }
    } catch (error) {
      console.error('Failed to add investment:', error)
      haptic.error()
    }
  }

  const handleToggleFinance = async (enabled: boolean) => {
    haptic.light()
    try {
      await updateSettingsMutation.mutateAsync({ financeEnabled: enabled })
      setFinanceEnabled(enabled)
    } catch (error) {
      console.error('Failed to toggle finance:', error)
    }
  }

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 90) return { color: 'text-red-600', label: 'Over Budget', icon: AlertTriangle }
    if (percentage >= 75) return { color: 'text-yellow-600', label: 'Warning', icon: Clock }
    return { color: 'text-green-600', label: 'On Track', icon: CheckCircle }
  }

  const getInvestmentPerformance = (performance: number) => {
    if (performance >= 10) return { color: 'text-green-600', label: 'Excellent', icon: TrendingUp }
    if (performance >= 5) return { color: 'text-blue-600', label: 'Good', icon: TrendingUp }
    if (performance >= 0) return { color: 'text-yellow-600', label: 'Stable', icon: Target }
    return { color: 'text-red-600', label: 'Declining', icon: TrendingDown }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Finance</h2>
          <p className="text-muted-foreground">
            Budget tracking, expense management og investment monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Finance Ready
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Tracking Active
          </Badge>
        </div>
      </div>

      {/* Finance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {budgetQuery.data?.totalBudget || 0} kr
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {expensesQuery.data?.totalExpenses || 0} kr
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {investmentsQuery.data?.totalValue || 0} kr
            </div>
            <p className="text-xs text-muted-foreground">
              Portfolio value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {settingsQuery.data?.totalSavings || 0} kr
            </div>
            <p className="text-xs text-muted-foreground">
              Total savings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'budget' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('budget')}
          className="flex-1"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Budget
        </Button>
        <Button
          variant={selectedTab === 'expenses' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('expenses')}
          className="flex-1"
        >
          <Receipt className="w-4 h-4 mr-2" />
          Expenses
        </Button>
        <Button
          variant={selectedTab === 'investments' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('investments')}
          className="flex-1"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Investments
        </Button>
        <Button
          variant={selectedTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('settings')}
          className="flex-1"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Budget Tab */}
      {selectedTab === 'budget' && (
        <div className="space-y-4">
          {/* Budget Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget Categories
              </CardTitle>
              <CardDescription>
                Track your spending across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetQuery.data?.categories?.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{category.spent} kr</div>
                        <div className="text-xs text-muted-foreground">
                          av {category.budget} kr
                        </div>
                      </div>

                      <Progress value={(category.spent / category.budget) * 100} className="w-20" />

                      <Badge variant={category.spent > category.budget * 0.9 ? 'destructive' : 'secondary'}>
                        {Math.round((category.spent / category.budget) * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Budget Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {budgetQuery.data?.budgetAnalytics?.map((analytic) => (
                  <div key={analytic.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <analytic.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-medium">{analytic.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {analytic.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses Tab */}
      {selectedTab === 'expenses' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Recent Expenses
              </CardTitle>
              <CardDescription>
                Track and manage your expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expensesQuery.data?.recentExpenses?.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <expense.icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {expense.category} • {expense.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{expense.amount} kr</div>
                        <div className="text-xs text-muted-foreground">
                          {expense.paymentMethod}
                        </div>
                      </div>

                      <Badge variant={expense.status === 'paid' ? 'default' : 'secondary'}>
                        {expense.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expense Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Expense Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expensesQuery.data?.expenseAnalytics?.map((analytic) => (
                  <div key={analytic.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{analytic.name}</span>
                      <span className="text-sm font-medium">{analytic.value}</span>
                    </div>
                    <Progress value={analytic.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investments Tab */}
      {selectedTab === 'investments' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Investment Portfolio
              </CardTitle>
              <CardDescription>
                Monitor your investments and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investmentsQuery.data?.investments?.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <investment.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{investment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {investment.type} • {investment.symbol}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{investment.currentValue} kr</div>
                        <div className="text-xs text-muted-foreground">
                          {investment.performance > 0 ? '+' : ''}{investment.performance}%
                        </div>
                      </div>

                      <Badge variant={investment.performance > 0 ? 'default' : 'secondary'}>
                        {investment.performance > 0 ? 'Gain' : 'Loss'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investment Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Investment Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {investmentsQuery.data?.investmentAnalytics?.map((analytic) => (
                  <div key={analytic.id} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <analytic.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="font-medium">{analytic.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {analytic.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Finance Settings
              </CardTitle>
              <CardDescription>
                Configure your finance tracking preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.settings?.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <setting.icon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{setting.name}</span>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={(enabled) => {
                        if (setting.key === 'financeEnabled') {
                          handleToggleFinance(enabled)
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Financial Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsQuery.data?.financialGoals?.map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <span className="text-sm font-medium">{goal.current} kr</span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Target: {goal.target} kr
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Raske handlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm">Add Expense</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">Update Budget</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Add Investment</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
