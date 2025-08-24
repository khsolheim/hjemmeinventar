'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain,
  Target,
  Zap,
  Lightbulb,
  Clock,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Star,
  Award,
  Trophy,
  Crown,
  Rocket,
  Sparkles,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  Scatter,
  Database,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Shield,
  Lock,
  Unlock,
  Key,
  Code,
  GitBranch,
  GitCommit,
  GitPullRequest
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useHapticFeedback } from '@/lib/services/haptic-feedback'

interface MachineLearningProps {
  className?: string
}

export function MachineLearning({ className }: MachineLearningProps) {
  const [selectedTab, setSelectedTab] = useState<'models' | 'training' | 'predictions' | 'data'>('models')
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const haptic = useHapticFeedback()

  // ML queries
  const modelsQuery = trpc.ml.getModels.useQuery()
  const trainingQuery = trpc.ml.getTrainingStatus.useQuery()
  const predictionsQuery = trpc.ml.getPredictions.useQuery()
  const dataQuery = trpc.ml.getDataInsights.useQuery()

  const trainModelMutation = trpc.ml.trainModel.useMutation()
  const deployModelMutation = trpc.ml.deployModel.useMutation()
  const generatePredictionMutation = trpc.ml.generatePrediction.useMutation()

  const handleTrainModel = async (modelId: string) => {
    haptic.success()
    try {
      await trainModelMutation.mutateAsync({ modelId })
    } catch (error) {
      console.error('Failed to train model:', error)
    }
  }

  const handleDeployModel = async (modelId: string) => {
    haptic.light()
    try {
      await deployModelMutation.mutateAsync({ modelId })
    } catch (error) {
      console.error('Failed to deploy model:', error)
    }
  }

  const handleGeneratePrediction = async (modelId: string, data: any) => {
    haptic.selection()
    try {
      await generatePredictionMutation.mutateAsync({ modelId, data })
    } catch (error) {
      console.error('Failed to generate prediction:', error)
    }
  }

  const getModelStatus = (status: string) => {
    switch (status) {
      case 'trained': return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Trent' }
      case 'training': return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Trener' }
      case 'deployed': return { color: 'bg-blue-100 text-blue-800', icon: Rocket, label: 'Deployet' }
      case 'error': return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Feil' }
      default: return { color: 'bg-gray-100 text-gray-800', icon: Info, label: 'Ukjent' }
    }
  }

  const getModelType = (type: string) => {
    switch (type) {
      case 'classification': return { icon: Target, color: 'text-blue-600' }
      case 'regression': return { icon: TrendingUp, color: 'text-green-600' }
      case 'clustering': return { icon: PieChart, color: 'text-purple-600' }
      case 'recommendation': return { icon: Star, color: 'text-orange-600' }
      default: return { icon: Brain, color: 'text-gray-600' }
    }
  }

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy >= 90) return { color: 'text-green-600', label: 'Utmerket' }
    if (accuracy >= 80) return { color: 'text-yellow-600', label: 'God' }
    if (accuracy >= 70) return { color: 'text-orange-600', label: 'OK' }
    return { color: 'text-red-600', label: 'Dårlig' }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Machine Learning</h2>
          <p className="text-muted-foreground">
            Modell-trening, prediksjoner og data-analyse
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            ML Engine
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            GPU Ready
          </Badge>
        </div>
      </div>

      {/* ML Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive modeller</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {modelsQuery.data?.activeModels || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deployet og aktive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gjennomsnittlig nøyaktighet</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {modelsQuery.data?.averageAccuracy || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Alle modeller
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediksjoner i dag</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {predictionsQuery.data?.todayPredictions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Genererte prediksjoner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data-punkter</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dataQuery.data?.totalDataPoints || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Treningsdata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'models' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('models')}
          className="flex-1"
        >
          <Brain className="w-4 h-4 mr-2" />
          Modeller
        </Button>
        <Button
          variant={selectedTab === 'training' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('training')}
          className="flex-1"
        >
          <Activity className="w-4 h-4 mr-2" />
          Trening
        </Button>
        <Button
          variant={selectedTab === 'predictions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('predictions')}
          className="flex-1"
        >
          <Target className="w-4 h-4 mr-2" />
          Prediksjoner
        </Button>
        <Button
          variant={selectedTab === 'data' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('data')}
          className="flex-1"
        >
          <Database className="w-4 h-4 mr-2" />
          Data
        </Button>
      </div>

      {/* Models Tab */}
      {selectedTab === 'models' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                ML Modeller
              </CardTitle>
              <CardDescription>
                Oversikt over alle machine learning modeller
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelsQuery.data?.models?.map((model) => {
                  const status = getModelStatus(model.status)
                  const StatusIcon = status.icon
                  const type = getModelType(model.type)
                  const TypeIcon = type.icon
                  const accuracy = getAccuracyLevel(model.accuracy)
                  
                  return (
                    <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <TypeIcon className={`w-6 h-6 ${type.color}`} />
                        </div>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {model.type} • {model.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${accuracy.color}`}>
                            {model.accuracy}% nøyaktighet
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {accuracy.label}
                          </div>
                        </div>
                        
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        
                        <div className="flex gap-1">
                          {model.status === 'trained' && (
                            <Button
                              size="sm"
                              onClick={() => handleDeployModel(model.id)}
                              disabled={model.status === 'deployed'}
                            >
                              <Rocket className="w-3 h-3" />
                            </Button>
                          )}
                          {model.status !== 'training' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTrainModel(model.id)}
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Training Tab */}
      {selectedTab === 'training' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Modell-trening
              </CardTitle>
              <CardDescription>
                Status på pågående og fullførte treninger
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingQuery.data?.sessions?.map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">{session.modelName}</div>
                        <div className="text-sm text-muted-foreground">
                          Startet: {new Date(session.startedAt).toLocaleString('no-NO')}
                        </div>
                      </div>
                      <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                        {session.status === 'completed' ? 'Fullført' : 'Pågår'}
                      </Badge>
                    </div>
                    
                    {session.status === 'training' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Fremgang</span>
                          <span>{session.progress}%</span>
                        </div>
                        <Progress value={session.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          ETA: {session.eta}
                        </div>
                      </div>
                    )}
                    
                    {session.status === 'completed' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Final accuracy</span>
                          <span className="font-medium">{session.finalAccuracy}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Training time</span>
                          <span>{session.duration}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictions Tab */}
      {selectedTab === 'predictions' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Prediksjoner
              </CardTitle>
              <CardDescription>
                Nylige prediksjoner og resultater
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictionsQuery.data?.predictions?.map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{prediction.modelName}</div>
                        <div className="text-sm text-muted-foreground">
                          {prediction.input} → {prediction.output}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">{prediction.confidence}%</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(prediction.timestamp).toLocaleTimeString('no-NO')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Tab */}
      {selectedTab === 'data' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data Quality */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Data-kvalitet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataQuery.data?.quality?.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <span className="text-sm font-medium">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Data-fordeling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataQuery.data?.distribution?.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.count} ({category.percentage}%)
                        </span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Data-innsikt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataQuery.data?.insights?.map((insight) => (
                  <div key={insight.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Info className="w-3 h-3 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {insight.description}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {insight.severity}
                    </Badge>
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
              <Upload className="w-5 h-5" />
              <span className="text-sm">Last opp data</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Retrain alle</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Eksporter modeller</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">Modell-detaljer</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
