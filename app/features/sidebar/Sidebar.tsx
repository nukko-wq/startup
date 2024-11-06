'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useCallback, useRef } from 'react'
import SidebarMenu from '@/app/features/sidebar/SidebarMenu'
import SpaceButtonMenu from '@/app/features/sidebar/SpaceButtonMenu'
import type { Space } from '@/app/types/space'
import { Button } from 'react-aria-components'
import {
	GridList,
	GridListItem,
	useDragAndDrop,
	DropIndicator,
} from 'react-aria-components'
import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
import { GripVertical, Layers3 } from 'lucide-react'
import SpacesMenu from '@/app/features/sidebar/SpacesMenu'
import { useWorkspaces } from '@/app/features/workspaces/contexts/WorkspaceContext'

export default function Sidebar() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const {
		spaces,
		setSpaces,
		reorderSpaces,
		activeSpaceId,
		setActiveSpaceId,
		setIsNavigating,
	} = useSpaces()
	const { workspaces, defaultWorkspace } = useWorkspaces()

	// デフォルトワークスペースに属するスペースのみをフィルタリング
	const defaultWorkspaceSpaces = spaces.filter(
		(space) => space.workspaceId === defaultWorkspace?.id,
	)

	const lastUpdateSource = useRef<string | null>(null)

	const handleSpaceSelect = useCallback(async (spaceId: string) => {
		try {
			await fetch('/api/users/last-active-space', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spaceId }),
			})
		} catch (error) {
			console.error('Error updating last active space:', error)
		}
	}, [])

	const handleSpaceClick = useCallback(
		async (spaceId: string) => {
			try {
				setIsNavigating(true)
				lastUpdateSource.current = 'click'

				// 状態更新を同期的に行う
				setActiveSpaceId(spaceId)

				// 少し待ってからナビゲーションを実行
				await new Promise((resolve) => setTimeout(resolve, 50))

				await Promise.all([
					router.push(`/?spaceId=${spaceId}`, { scroll: false }),
					handleSpaceSelect(spaceId),
				])
			} catch (error) {
				console.error('Error switching space:', error)
				setActiveSpaceId(activeSpaceId)
			} finally {
				setTimeout(() => {
					setIsNavigating(false)
				}, 500) // タイマーを500msに延長
			}
		},
		[
			router,
			handleSpaceSelect,
			setActiveSpaceId,
			setIsNavigating,
			activeSpaceId,
		],
	)

	const handleSpaceCreated = (space: Space) => {
		setSpaces((prevSpaces) => [...prevSpaces, space])
		// 新しいスペースを作成したら、そのスペースに移動
		handleSpaceClick(space.id)
	}

	useEffect(() => {
		if (defaultWorkspaceSpaces.length > 0 && !activeSpaceId) {
			const defaultSpace = defaultWorkspaceSpaces[0]
			handleSpaceClick(defaultSpace.id)
		}
	}, [defaultWorkspaceSpaces, activeSpaceId, handleSpaceClick])

	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			const space = defaultWorkspaceSpaces.find(
				(s) => s.id === Array.from(keys)[0],
			)
			return [
				{
					'text/plain': space?.name || '',
					'space-item': JSON.stringify(space),
				},
			]
		},
		onReorder(e) {
			const { target, keys } = e
			const draggedId = Array.from(keys)[0] as string
			const targetId = target.key as string

			const newSpaces = [...defaultWorkspaceSpaces]
			const draggedIndex = newSpaces.findIndex(
				(space) => space.id === draggedId,
			)
			const targetIndex = newSpaces.findIndex((space) => space.id === targetId)

			const [draggedSpace] = newSpaces.splice(draggedIndex, 1)
			newSpaces.splice(targetIndex, 0, draggedSpace)

			// orderを更新
			const updatedSpaces = newSpaces.map((space, index) => ({
				...space,
				order: index,
			}))

			reorderSpaces(updatedSpaces)
		},
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) =>
						`sidebar-drop-indicator ${isDropTarget ? 'active' : ''}`
					}
				/>
			)
		},
	})

	// activeSpaceIdの変更を監視
	useEffect(() => {
		console.log('activeSpaceId updated:', activeSpaceId)
		console.log('selectedKeys value:', activeSpaceId ? [activeSpaceId] : [])
	}, [activeSpaceId])

	// デバッグ用のuseEffect
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		console.log('Component rendered with activeSpaceId:', activeSpaceId)
	}, [])

	/*
	const handleWorkspaceCreated = (workspace: Workspace) => {
		// ワークスペースリストを更新
		setWorkspaces((prevWorkspaces) => [...prevWorkspaces, workspace])
	}
		*/

	return (
		<div className="w-64 bg-gray-800 h-screen flex flex-col">
			<div className="flex items-center justify-between p-4">
				<div className="text-zinc-50 text-2xl font-semibold">Startup</div>
				<SidebarMenu />
			</div>
			<div className="p-4">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center">
						<Layers3 className="w-6 h-6 text-zinc-50 mr-2" />
						<h1 className="text-lg font-semibold text-zinc-50">Spaces</h1>
					</div>
					<SpacesMenu />
				</div>
				<GridList
					items={defaultWorkspaceSpaces}
					dragAndDropHooks={dragAndDropHooks}
					aria-label="スペース一覧"
					selectionMode="single"
					selectedKeys={activeSpaceId ? [activeSpaceId] : []}
					disallowEmptySelection
					onSelectionChange={(keys) => {
						const selectedKey = Array.from(keys)[0] as string
						if (selectedKey) {
							handleSpaceClick(selectedKey)
						}
					}}
					className="flex flex-col pt-2"
				>
					{/* Default Workspaceのスペースのリストを表示 */}
					{(space) => (
						<GridListItem
							key={space.id}
							textValue={space.name}
							className={({ isSelected, isFocusVisible }) => `
								flex items-center justify-between outline-none cursor-pointer hover:bg-gray-700 hover:bg-opacity-75 group py-1
								${isSelected ? 'bg-gray-700' : ''}
								${isFocusVisible ? 'ring-2 ring-blue-500' : ''}
							`}
						>
							<div className="flex items-center w-full group">
								<div
									className="cursor-grab flex items-center opacity-0 group-hover:opacity-100"
									aria-label="Drag Wrapper"
								>
									<Button
										slot="drag"
										aria-label="ドラッグハンドル"
										className="cursor-grab p-2"
									>
										<GripVertical className="w-4 h-4 text-zinc-500" />
									</Button>
								</div>
								<Button
									className="px-2 py-2 rounded cursor-pointer block w-full text-left text-zinc-50 outline-none"
									onPress={() => handleSpaceClick(space.id)}
								>
									{space.name}
								</Button>
							</div>
							<SpaceButtonMenu
								spaceId={space.id}
								spaceName={space.name}
								setSpaces={setSpaces}
							/>
						</GridListItem>
					)}
				</GridList>
				<div className="mt-4">
					<div className="px-4 py-2 text-sm font-semibold text-zinc-400">
						Workspaces
					</div>
					<ul className="space-y-1">
						{workspaces.map((workspace) => (
							<li
								key={workspace.id}
								className="px-4 py-2 text-sm text-zinc-300"
							>
								<div className="font-medium mb-2">{workspace.name}</div>
								<div className="pl-4">
									{spaces
										.filter((space) => space.workspaceId === workspace.id)
										.map((space) => (
											<div
												key={space.id}
												className="flex items-center justify-between group"
											>
												<Button
													className="w-full text-left px-2 py-1 rounded hover:bg-zinc-800"
													onPress={() => handleSpaceClick(space.id)}
												>
													{space.name}
												</Button>
												<SpaceButtonMenu
													spaceId={space.id}
													spaceName={space.name}
													setSpaces={setSpaces}
												/>
											</div>
										))}
									{spaces.filter((space) => space.workspaceId === workspace.id)
										.length === 0 && <div>Create Space</div>}
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	)
}
