'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, Users, DollarSign, Clock, ArrowLeft, ExternalLink, Sparkles, RefreshCw } from 'lucide-react'

interface FaucetStats {
  totalRequests: number
  stats: Array<{ status: string; _count: { status: number } }>
  recentRequests: Array<{
    id: string
    walletAddress: string
    amount: string
    status: string
    createdAt: string
    txHash?: string
  }>
}

export default function AdminPage() {
  const [stats, setStats] = useState<FaucetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async (manual = false) => {
    if (manual) setRefreshing(true)
    try {
      const response = await fetch('/api/faucet')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
      if (manual) setRefreshing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-background to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-background to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load statistics</p>
        </div>
      </div>
    )
  }

  const completedRequests = stats.stats.find(s => s.status === 'completed')?._count.status || 0
  const failedRequests = stats.stats.find(s => s.status === 'failed')?._count.status || 0
  const pendingRequests = stats.stats.find(s => s.status === 'pending')?._count.status || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-background to-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Faucet Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-400">Monitor and manage your Sui testnet faucet</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchStats(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link 
                href="/" 
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Faucet
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="backdrop-blur-xl bg-card/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalRequests}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{completedRequests}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Failed</CardTitle>
              <DollarSign className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{failedRequests}</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-card/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{pendingRequests}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList className="bg-card/50 border-white/10">
            <TabsTrigger value="recent" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
              Recent Requests
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <Card className="backdrop-blur-xl bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Faucet Requests</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest 10 requests to the faucet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentRequests.map((request) => (
                    <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-white/10 rounded-lg bg-card/20 backdrop-blur-sm gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-1">
                          <p className="font-mono text-sm text-gray-300 break-all">{request.walletAddress}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="text-right">
                          <p className="font-medium text-white">{(parseInt(request.amount) / 1e9).toFixed(2)} SUI</p>
                          {request.txHash && (
                            <a 
                              href={`https://testnet.suivision.xyz/txblock/${request.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            >
                              View TX
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="backdrop-blur-xl bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Request Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.stats.map((stat) => (
                      <div key={stat.status} className="flex justify-between items-center">
                        <span className="capitalize text-gray-300">{stat.status}</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {stat._count.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {stats.totalRequests > 0 
                        ? ((completedRequests / stats.totalRequests) * 100).toFixed(1)
                        : 0}%
                    </div>
                    <p className="text-gray-400 mt-2">
                      {completedRequests} of {stats.totalRequests} requests successful
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
