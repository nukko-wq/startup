// /app/lib/redux/features/tabs/types/tabs.ts

export interface Tab {
	id: number
	title: string
	url: string
	faviconUrl?: string
	pinned: boolean
}

export interface TabsState {
	tabs: Tab[]
	status: 'idle' | 'loading' | 'succeeded' | 'failed'
	error: string | null
}
