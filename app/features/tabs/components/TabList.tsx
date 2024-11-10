'use client'

import { useEffect, useState } from 'react'
import { useResourceStore } from '@/app/store/resourceStore'

interface Tab {
  id: number
  title: string
  url: string
  faviconUrl: string
}

export default function TabList() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [extensionId, setExtensionId] = useState<string>('')
  const { addResource } = useResourceStore()

  const handleTabClick = async (tab: Tab) => {
    try {
      const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
      if (!extensionId) {
        console.error('Extension ID not found')
        return
      }

      await chrome.runtime.sendMessage(
        extensionId,
        { 
          type: 'ACTIVATE_TAB',
          tabId: tab.id
        }
      )
    } catch (error) {
      console.error('Failed to activate tab:', error)
      // フォールバック：新しいタブで開く
      window.open(tab.url, '_blank')
    }
  }

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        if (typeof window === 'undefined' || !window.chrome?.runtime) {
          setIsLoading(false)
          return
        }

        const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
        if (!extensionId) {
          console.error('Extension ID not found')
          setIsLoading(false)
          return
        }

        console.log('Sending message to extension:', extensionId)
        const response = await window.chrome.runtime.sendMessage(
          extensionId,
          { type: 'GET_CURRENT_TABS' }
        )
        
        console.log('Received response:', response)
        if (response) {
          setTabs(response)
        }
      } catch (error) {
        console.error('Failed to fetch tabs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTabs()
  }, [])

  if (isLoading) {
    return <div>タブを読み込み中...</div>
  }

  if (typeof window === 'undefined' || !window.chrome?.runtime) {
    return (
      <div className="text-center p-4">
        Chrome拡張機能をインストールすると、開いているタブを表示できます
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">開いているタブ</h2>
      <div className="space-y-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => handleTabClick(tab)}
          >
            {tab.faviconUrl ? (
              <img src={tab.faviconUrl} alt="" className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4 bg-gray-200 rounded-full" />
            )}
            <span className="truncate">{tab.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 