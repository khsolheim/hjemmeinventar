'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy,
  Star,
  Target,
  TrendingUp,
  Users,
  Award,
  Zap,
  Calendar,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Gift,
  Crown,
  Medal,
  Fire
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface GamificationSystemProps {
  className?: string
}

export function GamificationSystem({ className }: GamificationSystemProps) {
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'progress' | 'leaderboard'>('achievements')
  const haptic = useHapticFeedback()

  // Gamification queries
  const achievementsQuery = trpc.gamification.getAchievements.useQuery()
  const progressQuery = trpc.gamification.getProgress.useQuery()
  const leaderboardQuery = trpc.gamification.getLeaderboard.useQuery()
  const userStatsQuery = trpc.gamification.getUserStats.useQuery()

  const claimRewardMutation = trpc.gamification.claimReward.useMutation()

  const handleClaimReward = async (achievementId: string) => {
    haptic.success()
    try {
      await claimRewardMutation.mutateAsync({ achievementId })
    } catch (error) {
      console.error('Failed to claim reward:', error)
    }
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'items': return Package
      case 'locations': return MapPin
      case 'streak': return Fire
      case 'collaboration': return Users
      case 'efficiency': return Zap
      case 'mastery': return Crown
      default: return Star
    }
  }

  const getAchievementColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800'
      case 'rare': return 'bg-blue-100 text-blue-800'
      case 'epic': return 'bg-purple-100 text-purple-800'
      case 'legendary': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'text-yellow-600'
    if (level >= 30) return 'text-purple-600'
    if (level >= 20) return 'text-blue-600'
    if (level >= 10) return 'text-green-600'
    return 'text-gray-600'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gamification</h2>
          <p className="text-muted-foreground">
            Oppnå prestasjoner og konkurrer med andre
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <span className="text-lg font-bold text-yellow-600">
            {userStatsQuery.data?.totalPoints || 0} poeng
          </span>
        </div>
      </div>

      {/* User Stats Overview */}
      {userStatsQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nivå</CardTitle>
              <Crown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getLevelColor(userStatsQuery.data.level)}`}>
                {userStatsQuery.data.level}
              </div>
              <Progress 
                value={(userStatsQuery.data.currentXP / userStatsQuery.data.xpToNext) * 100} 
                className="mt-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {userStatsQuery.data.currentXP} / {userStatsQuery.data.xpToNext} XP
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prestasjoner</CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {userStatsQuery.data.achievementsUnlocked}
              </div>
              <p className="text-xs text-muted-foreground">
                av {userStatsQuery.data.totalAchievements} mulige
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Fire className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {userStatsQuery.data.currentStreak}
              </div>
              <p className="text-xs text-muted-foreground">
                dager på rad
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                #{userStatsQuery.data.ranking}
              </div>
              <p className="text-xs text-muted-foreground">
                av {userStatsQuery.data.totalUsers} brukere
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'achievements' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('achievements')}
          className="flex-1"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Prestasjoner
        </Button>
        <Button
          variant={selectedTab === 'progress' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('progress')}
          className="flex-1"
        >
          <Target className="w-4 h-4 mr-2" />
          Fremdrift
        </Button>
        <Button
          variant={selectedTab === 'leaderboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('leaderboard')}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          Toppliste
        </Button>
      </div>

      {/* Achievements Tab */}
      {selectedTab === 'achievements' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievementsQuery.data?.map((achievement) => {
              const IconComponent = getAchievementIcon(achievement.type)
              const isUnlocked = achievement.progress >= achievement.target
              const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100)

              return (
                <Card 
                  key={achievement.id} 
                  className={`transition-all duration-200 ${
                    isUnlocked ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isUnlocked ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-5 h-5 ${
                            isUnlocked ? 'text-yellow-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{achievement.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getAchievementColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fremdrift</span>
                        <span>{achievement.progress} / {achievement.target}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {achievement.points} poeng
                        </span>
                        {isUnlocked && !achievement.claimed && (
                          <Button
                            size="sm"
                            onClick={() => handleClaimReward(achievement.id)}
                            disabled={claimRewardMutation.isLoading}
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Krev belønning
                          </Button>
                        )}
                        {achievement.claimed && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Krevd
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {selectedTab === 'progress' && (
        <div className="space-y-4">
          {progressQuery.data?.categories.map((category) => (
            <Card key={category.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {category.name}
                </CardTitle>
                <CardDescription>
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.goals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.progress} / {goal.target}
                        </span>
                      </div>
                      <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{goal.description}</span>
                        <span>{goal.points} poeng</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {selectedTab === 'leaderboard' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Toppliste
              </CardTitle>
              <CardDescription>
                De beste brukerne denne måneden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardQuery.data?.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
                      index === 1 ? 'bg-gray-50 border-2 border-gray-200' :
                      index === 2 ? 'bg-orange-50 border-2 border-orange-200' :
                      'border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-500 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Nivå {user.level} • {user.achievements} prestasjoner
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-bold text-lg">{user.points}</div>
                      <div className="text-sm text-muted-foreground">poeng</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Nylig aktivitet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userStatsQuery.data?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString('no-NO')}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  +{activity.points} XP
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
