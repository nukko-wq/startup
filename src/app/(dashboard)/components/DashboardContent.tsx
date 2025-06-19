'use client'

import SpaceOverlay from '@/app/(dashboard)/components/SpaceOverlay'
import Header from '@/app/components/header/Header'
import Sidebar from '@/app/components/sidebar/sidebar'
import SectionListWrapper from '@/app/features/section/components/main/SectionListWrapper'
import TabList from '@/app/features/tabs/components/main/TabList'
import { showSpaceOverlay } from '@/app/lib/redux/features/overlay/overlaySlice'
import {
	createResource,
	reorderResources,
} from '@/app/lib/redux/features/resource/resourceAPI'
import { setResources } from '@/app/lib/redux/features/resource/resourceSlice'
import { reorderSections } from '@/app/lib/redux/features/section/sectionAPI'
import { setSections } from '@/app/lib/redux/features/section/sectionSlice'
import { selectSectionsByActiveSpace } from '@/app/lib/redux/features/section/selector'
import { tabsAPI } from '@/app/lib/redux/features/tabs/tabsAPI'
import { reorderTabs } from '@/app/lib/redux/features/tabs/tabsSlice'
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { memo, useEffect } from 'react'
import { Suspense } from 'react'

interface ExtensionMessage {
	source: string
	type: string
}

const TabListFallback = () => (
	<div className="flex w-1/2 justify-center">
		<div className="max-w-[920px] grow animate-pulse py-5 pr-[16px] pl-[32px]">
			<div className="h-[400px] rounded-md bg-gray-100" />
		</div>
	</div>
)

const DashboardContent = memo(() => {
	const dispatch = useAppDispatch()
	const { sections } = useAppSelector(selectSectionsByActiveSpace)
	const activeSpaceId = useAppSelector((state) => state.space.activeSpaceId)
	const allResources = useAppSelector((state) => state.resource.resources)
	const tabs = useAppSelector((state) => state.tabs.tabs)

	useEffect(() => {
		const handleMessage = (event: MessageEvent<ExtensionMessage>) => {
			if (
				event.data.source === 'startup-extension' &&
				event.data.type === 'SHOW_SPACE_LIST_OVERLAY'
			) {
				console.log('Showing space overlay')
				dispatch(showSpaceOverlay())
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [dispatch])

	const onDragEnd = async (result: DropResult) => {
		const { source, destination, draggableId, type } = result

		// デバッグログ
		console.log('Drag end:', {
			source,
			destination,
			draggableId,
			type,
		})

		if (!destination || !activeSpaceId) return
		if (!source.droppableId || !destination.droppableId) return

		// タブ間の並び替え処理
		if (source.droppableId === 'tabs' && destination.droppableId === 'tabs') {
			console.log('Processing tab reordering:', {
				sourceIndex: source.index,
				destinationIndex: destination.index,
				draggableId,
			})

			// Redux状態で楽観的更新
			dispatch(
				reorderTabs({
					sourceIndex: source.index,
					destinationIndex: destination.index,
				}),
			)

			try {
				// Tab IDを取得
				const numericTabId = Number.parseInt(
					draggableId.replace('tab-', ''),
					10,
				)

				// 拡張機能経由でブラウザのタブを移動
				await tabsAPI.moveTab(numericTabId, destination.index)
				console.log('Tab moved successfully in browser')
			} catch (error) {
				console.error('Failed to move tab in browser:', error)
				// 失敗した場合は元に戻す
				dispatch(
					reorderTabs({
						sourceIndex: destination.index,
						destinationIndex: source.index,
					}),
				)
			}
			return
		}

		// TabからResourceへの変換処理
		if (draggableId.startsWith('tab-')) {
			console.log('Processing tab to resource conversion:', draggableId)
			try {
				// Tab IDから実際のタブ情報を取得
				const numericTabId = Number.parseInt(
					draggableId.replace('tab-', ''),
					10,
				)
				const tab = tabs.find((t) => t.id === numericTabId)

				console.log('Found tab:', tab)

				if (!tab) {
					console.error('Tab not found:', draggableId)
					return
				}

				console.log(
					'Creating resource with data:',
					{
						title: tab.title,
						url: tab.url,
						sectionId: destination.droppableId,
						faviconUrl: tab.faviconUrl,
					},
					'at index:',
					destination.index,
				)

				// 目的のセクションの既存リソースを取得
				const destinationResources = allResources
					.filter((resource) => resource.sectionId === destination.droppableId)
					.sort((a, b) => a.order - b.order)

				// 楽観的更新: 一時的なResourceを作成して指定位置に挿入
				const tempResourceId = `temp-${Date.now()}`
				const tempResource = {
					id: tempResourceId,
					title: tab.title,
					url: tab.url,
					faviconUrl: tab.faviconUrl || null,
					description: null,
					sectionId: destination.droppableId,
					userId: '',
					order: destination.index,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				}

				// 楽観的更新: 既存のリソースの順序を調整して新しいリソースを挿入
				const updatedResources = allResources.map((resource) => {
					// 他のセクションのリソースはそのまま
					if (resource.sectionId !== destination.droppableId) {
						return resource
					}
					// 挿入位置以降のリソースの順序を+1
					if (resource.order >= destination.index) {
						return {
							...resource,
							order: resource.order + 1,
						}
					}
					return resource
				})

				// 一時的なリソースを追加
				updatedResources.push(tempResource)
				dispatch(setResources(updatedResources))

				// APIでResourceを作成
				const newResource = await createResource({
					title: tab.title,
					url: tab.url,
					sectionId: destination.droppableId,
					faviconUrl: tab.faviconUrl,
				})

				console.log('Created resource:', newResource)

				// 一時的なリソースを削除して実際のリソースに置き換え
				const finalResources = updatedResources.map((resource) => {
					if (resource.id === tempResourceId) {
						return {
							...newResource,
							order: destination.index,
						}
					}
					return resource
				})
				dispatch(setResources(finalResources))

				// reorderResources APIを使用して正しい順序でサーバーを更新
				try {
					const reorderedResources = await reorderResources({
						resourceId: newResource.id,
						destinationSectionId: destination.droppableId,
						newOrder: destination.index,
					})
					dispatch(setResources(reorderedResources))
				} catch (reorderError) {
					console.error('Failed to reorder resource:', reorderError)
					// リオーダーに失敗した場合は楽観的更新の状態を保持
				}
			} catch (error) {
				console.error('Failed to create resource from tab:', error)
				// エラーが発生した場合は元の状態に戻す
				dispatch(setResources(allResources))
			}
			return
		}

		// セクションのドラッグ&ドロップ処理
		if (type === 'section') {
			const items = Array.from(sections)
			const [reorderedItem] = items.splice(source.index, 1)
			items.splice(destination.index, 0, reorderedItem)

			// 新しい順序でセクションを一時的に更新（楽観的更新）
			const updatedItems = items.map((section, index) => ({
				...section,
				order: index,
			}))

			dispatch(setSections(updatedItems))

			try {
				const updatedSections = await reorderSections(
					activeSpaceId,
					updatedItems,
				)
				dispatch(setSections(updatedSections))
			} catch (error) {
				console.error('セクションの並び替えに失敗しました:', error)
				dispatch(setSections(sections))
			}
			return
		}

		// リソースの並び替え
		const sourceResources = allResources
			.filter((resource) => resource.sectionId === source.droppableId)
			.sort((a, b) => a.order - b.order)

		const destinationResources = allResources
			.filter((resource) => resource.sectionId === destination.droppableId)
			.sort((a, b) => a.order - b.order)

		// 同じセクション内での並び替え
		if (source.droppableId === destination.droppableId) {
			const newResources = Array.from(sourceResources)
			const [movedResource] = newResources.splice(source.index, 1)
			newResources.splice(destination.index, 0, movedResource)

			// 楽観的更新の修正
			const updatedResources = allResources.map((resource) => {
				if (resource.sectionId !== source.droppableId) return resource
				const index = newResources.findIndex((r) => r.id === resource.id)
				if (index === -1) return resource
				return {
					...resource,
					order: index,
				}
			})
			dispatch(setResources(updatedResources))

			try {
				const updatedFromApi = await reorderResources({
					resourceId: draggableId,
					destinationSectionId: destination.droppableId,
					newOrder: destination.index,
				})
				dispatch(setResources(updatedFromApi))
			} catch (error) {
				console.error('リソースの並び替えに失敗しました:', error)
				dispatch(setResources(allResources)) // 元の状態に戻す
			}
		}
		// 異なるセクション間での移動
		else {
			const sourceItems = Array.from(sourceResources)
			const [movedResource] = sourceItems.splice(source.index, 1)
			const destinationItems = Array.from(destinationResources)
			destinationItems.splice(destination.index, 0, {
				...movedResource,
				sectionId: destination.droppableId,
			})

			// 楽観的更新の改善
			const updatedResources = allResources.map((resource) => {
				// 移動したリソースの更新
				if (resource.id === movedResource.id) {
					return {
						...resource,
						sectionId: destination.droppableId,
						order: destination.index,
					}
				}

				// 移動元セクションのリソースの更新
				if (resource.sectionId === source.droppableId) {
					const newIndex = sourceItems.findIndex((r) => r.id === resource.id)
					return {
						...resource,
						order: newIndex === -1 ? resource.order : newIndex,
					}
				}

				// 移動先セクションのリソースの更新
				if (resource.sectionId === destination.droppableId) {
					const newIndex = destinationItems.findIndex(
						(r) => r.id === resource.id,
					)
					return {
						...resource,
						order: newIndex === -1 ? resource.order : newIndex,
					}
				}

				return resource
			})

			dispatch(setResources(updatedResources))

			try {
				const updatedFromApi = await reorderResources({
					resourceId: draggableId,
					destinationSectionId: destination.droppableId,
					newOrder: destination.index,
				})
				dispatch(setResources(updatedFromApi))
			} catch (error) {
				console.error('リソースの移動に失敗しました:', error)
				dispatch(setResources(allResources)) // 元の状態に戻す
			}
		}
	}

	return (
		<div className="flex h-full w-full">
			<div className="flex h-full w-full flex-col">
				<div className="flex bg-slate-50 md:grid md:grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr]">
					<Sidebar />
					<main className="flex grow flex-col items-center bg-slate-100">
						<Header />
						<DragDropContext onDragEnd={onDragEnd}>
							<div className="flex h-[calc(100vh-70px)] w-full grow">
								<Suspense fallback={<TabListFallback />}>
									<TabList />
								</Suspense>
								<div className="flex w-full justify-center md:w-1/2">
									<SectionListWrapper />
								</div>
							</div>
						</DragDropContext>
					</main>
				</div>
			</div>
			<SpaceOverlay />
		</div>
	)
})

DashboardContent.displayName = 'DashboardContent'

export default DashboardContent
