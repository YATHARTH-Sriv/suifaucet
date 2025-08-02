'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Droplets, CheckCircle, AlertCircle } from 'lucide-react'

export default function FaucetPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [txHash, setTxHash] = useState('')

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
        setMessage({ type: 'success', text: data.message })
        setTxHash(data.txHash || '')
        setWalletAddress('')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Navigation */}
        <div className="mb-6 text-center">
          <Link 
            href="/admin" 
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Admin Dashboard →
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Sui Testnet Faucet
              </CardTitle>
              <CardDescription className="text-gray-600">
                Get free SUI tokens for testing on Sui testnet
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="wallet" className="text-sm font-medium text-gray-700">
                Wallet Address
              </Label>
              <Input
                id="wallet"
                type="text"
                placeholder="0x1234...abcd"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono text-sm"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Enter your Sui wallet address to receive 0.5 SUI token
              </p>
            </div>

            <Button 
              onClick={requestTokens}
              disabled={isLoading || !walletAddress}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting Tokens...
                </>
              ) : (
                <>
                  <Droplets className="w-4 h-4 mr-2" />
                  Request Tokens
                </>
              )}
            </Button>

            {message && (
              <Alert className={`border ${
                message.type === 'success' ? 'border-green-200 bg-green-50' :
                message.type === 'error' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={
                  message.type === 'success' ? 'text-green-800' :
                  message.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {txHash && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Transaction Hash
                </Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-xs font-mono break-all text-gray-600">
                    {txHash}
                  </p>
                </div>
                <a 
                  href={`https://testnet.suivision.xyz/txblock/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  View on Sui Explorer →
                </a>
              </div>
            )}

            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>Rate limited: 1 request per hour per IP/wallet</p>
              <p>Testnet tokens have no real value</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}