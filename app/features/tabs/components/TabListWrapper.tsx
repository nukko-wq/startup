'use client'

import dynamic from 'next/dynamic'

const TabList = dynamic(() => import('./TabList'), {
	ssr: false,
})

export default function TabListWrapper() {
	return <TabList />
}
