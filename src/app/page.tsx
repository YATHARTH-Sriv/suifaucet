'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Droplets, CheckCircle, AlertCircle, ExternalLink, Sparkles } from 'lucide-react'

export default function FaucetPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'info', text: string } | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successData, setSuccessData] = useState<{ txHash: string; explorerUrl: string } | null>(null)

  const validateSuiAddress = (address: string): boolean => {
    // Basic Sui address validation - should start with 0x and be 66 characters long
    const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/
    return suiAddressRegex.test(address)
  }

  const requestTokens = async () => {
    if (!walletAddress) {
      setMessage({ type: 'error', text: 'Please enter a wallet address' })
      return
    }

    if (!validateSuiAddress(walletAddress)) {
      setMessage({ type: 'error', text: 'Please enter a valid Sui wallet address (0x followed by 64 hex characters)' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessData({
          txHash: data.txHash || '',
          explorerUrl: data.explorerUrl || ''
        })
        setShowSuccessPopup(true)
        setWalletAddress('')
        setMessage(null)
      } else {
        setMessage({ type: 'error', text: data.error || 'Request failed' })
      }
    } catch (networkError) {
      console.error('Network error:', networkError)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-background to-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-blue-400" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Sui Faucet
          </span>
        </div>
        <Link 
          href="/admin" 
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-1"
        >
          Admin Dashboard
          <ExternalLink className="w-3 h-3" />
        </Link>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-md lg:max-w-lg">
          <Card className="backdrop-blur-xl bg-card/50 border-white/10 shadow-2xl">
            <CardHeader className="text-center space-y-6 pb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Droplets className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Sui Testnet Faucet
                </CardTitle>
                <CardDescription className="text-gray-400 text-base lg:text-lg">
                  Get free SUI tokens for testing on Sui testnet
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8 pb-8">
              <div className="space-y-3">
                <Label htmlFor="wallet" className="text-sm font-medium text-gray-300">
                  Wallet Address
                </Label>
                <Input
                  id="wallet"
                  type="text"
                  placeholder="0x1234...abcd"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="font-mono text-sm bg-input/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Enter your Sui wallet address to receive 1 SUI tokens
                </p>
              </div>

              <Button 
                onClick={requestTokens}
                disabled={isLoading || !walletAddress}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 h-12 text-base font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Requesting Tokens...
                  </>
                ) : (
                  <>
                    <Droplets className="w-5 h-5 mr-2" />
                    Request Tokens
                  </>
                )}
              </Button>

              {message && (
                <Alert className={`border backdrop-blur-sm ${
                  message.type === 'error' 
                    ? 'border-red-500/50 bg-red-500/10' 
                    : 'border-blue-500/50 bg-blue-500/10'
                }`}>
                  <AlertCircle className={`h-4 w-4 ${
                    message.type === 'error' ? 'text-red-400' : 'text-blue-400'
                  }`} />
                  <AlertDescription className={
                    message.type === 'error' 
                      ? 'text-red-300' 
                      : 'text-blue-300'
                  }>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center text-xs text-gray-500 space-y-1 pt-4 border-t border-white/10">
                <p>⏱️ Rate limited: 1 request per hour per IP/wallet</p>
                <p>🧪 Testnet tokens have no real value</p>
                <p className="text-blue-400">Built for the Sui ecosystem</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl backdrop-blur-xl">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-green-400">Success!</h3>
                <p className="text-gray-300">1 SUI has been sent to your wallet</p>
              </div>
              {successData && (
                <div className="space-y-3">
                  <div className="p-3 bg-input/30 rounded-lg border border-white/10">
                    <p className="text-xs font-mono break-all text-gray-400 mb-2">
                      Transaction: {successData.txHash}
                    </p>
                    <a 
                      href={successData.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                    >
                      View on Explorer 
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
              <Button 
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}