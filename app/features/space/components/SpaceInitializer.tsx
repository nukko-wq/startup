'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setActiveSpace } from '@/app/lib/redux/features/space/spaceSlice'

interface SpaceInitializerProps {
	spaceId: string
}

const SpaceInitializer = ({ spaceId }: SpaceInitializerProps) => {
	const dispatch = useDispatch()

	useEffect(() => {
		dispatch(setActiveSpace(spaceId))
	}, [dispatch, spaceId])

	return null
}

export default SpaceInitializer
