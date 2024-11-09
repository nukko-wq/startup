'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useCallback, useRef } from 'react'
import SidebarMenu from '@/app/features/sidebar/SidebarMenu'
import SpaceButtonMenu from '@/app/features/sidebar/SpaceButtonMenu'
import type { Space } from '@/app/types/space'
import { Button, Link } from 'react-aria-components'
import {
	GridList,
	GridListItem,
	useDragAndDrop,
	DropIndicator,
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import { useSpaces } from '@/app/features/spaces/contexts/SpaceContext'
import {
	CircleChevronRight,
	GripVertical,
	Layers,
	Layers3,
	Plus,
} from 'lucide-react'
import SpacesMenu from '@/app/features/sidebar/SpacesMenu'
import { useWorkspaces } from '@/app/features/workspaces/contexts/WorkspaceContext'
import CreateSpaceForm from '@/app/features/spaces/create_space/CreateSpaceForm'
import WorkspaceButtonMenu from './WorkspaceButtonMenu'
import Workspace from '@/app/features/sidebar/Workspace'

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
	const { workspaces, setWorkspaces, reorderWorkspaces, defaultWorkspace } =
		useWorkspaces()

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
		// スペースを追加する前に、既存のスペースをフィルタリング
		const updatedSpaces = spaces.filter(
			(s) => s.workspaceId === space.workspaceId,
		)
		// 新しいスペースを追加
		const newSpaces = [...updatedSpaces, space]
		setSpaces(newSpaces)
		// 新しいスペースに移動
		handleSpaceClick(space.id)
	}

	useEffect(() => {
		if (defaultWorkspaceSpaces.length > 0 && !activeSpaceId) {
			const defaultSpace = defaultWorkspaceSpaces[0]
			handleSpaceClick(defaultSpace.id)
		}
	}, [defaultWorkspaceSpaces, activeSpaceId, handleSpaceClick])

	const { dragAndDropHooks: spaceDragAndDropHooks } = useDragAndDrop({
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

	const { dragAndDropHooks: workspaceDragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			const workspace = workspaces.find((w) => w.id === Array.from(keys)[0])
			if (!workspace || workspace.isDefault) return []
			return [
				{
					'text/plain': workspace.name,
					'workspace-item': JSON.stringify(workspace),
				},
			]
		},
		onReorder(e) {
			const { target, keys } = e
			const draggedId = Array.from(keys)[0] as string
			const targetId = target.key as string

			// デフォルトワークスペースを除外した配列を作成
			const nonDefaultWorkspaces = workspaces.filter((w) => !w.isDefault)

			const draggedIndex = nonDefaultWorkspaces.findIndex(
				(w) => w.id === draggedId,
			)
			const targetIndex = nonDefaultWorkspaces.findIndex(
				(w) => w.id === targetId,
			)

			if (draggedIndex === -1 || targetIndex === -1) return

			const newWorkspaces = [...nonDefaultWorkspaces]
			const [draggedWorkspace] = newWorkspaces.splice(draggedIndex, 1)
			newWorkspaces.splice(targetIndex, 0, draggedWorkspace)

			// orderを1から振り直し
			const reorderedWorkspaces = newWorkspaces.map((workspace, index) => ({
				...workspace,
				order: index + 1,
			}))

			// デフォルトワークスペースは常に先頭（order: 0）
			if (defaultWorkspace) {
				reorderWorkspaces({
					items: [defaultWorkspace, ...reorderedWorkspaces],
				})
			}
		},
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) =>
						`workspace-drop-indicator ${isDropTarget ? 'active' : ''}`
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

	const handleCreateSpace = async (
		data: { name: string },
		workspaceId: string,
		close: () => void,
	) => {
		try {
			const response = await fetch('/api/spaces', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					workspaceId: workspaceId,
				}),
			})

			if (!response.ok) {
				throw new Error('スペースの作成に失敗しました')
			}

			const newSpace = await response.json()
			setSpaces((prev) => [...prev, newSpace])
			handleSpaceClick(newSpace.id)
			close() // モーダルを閉じる
		} catch (error) {
			console.error('Error creating space:', error)
		}
	}

	return (
		<div className="w-[320px] bg-gray-800 h-screen flex flex-col">
			<div className="flex items-center justify-between pl-4 pr-3 pt-4 pb-4">
				<Link
					href="/"
					className="text-zinc-50 text-2xl font-semibold outline-none"
				>
					Startup
				</Link>
				<SidebarMenu />
			</div>
			<Workspace />
		</div>
	)
}
