import { updateSpaceLastActive } from '@/app/lib/redux/features/space/spaceAPI'
import { setActiveSpace } from '@/app/lib/redux/features/space/spaceSlice'
import { useAppDispatch } from '@/app/lib/redux/hooks'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export const useSpaceSwitch = () => {
	const dispatch = useAppDispatch()
	const router = useRouter()

	const switchSpace = useCallback(
		async (spaceId: string, workspaceId: string) => {
			try {
				// ローカル状態を即座に更新（楽観的更新）
				dispatch(setActiveSpace(spaceId))

				// サーバーサイド更新を非同期で実行
				await dispatch(
					updateSpaceLastActive({
						spaceId,
						workspaceId,
					}),
				).unwrap()

				// ページ遷移
				router.push(`/space/${spaceId}`, {
					scroll: false,
				})

				return { success: true }
			} catch (error) {
				console.error('Space switch failed:', error)
				
				// エラー時のロールバック処理は現在のところ不要
				// （楽観的更新のメリットを活かし、ユーザー体験を優先）
				
				return { 
					success: false, 
					error: error instanceof Error ? error.message : 'Unknown error' 
				}
			}
		},
		[dispatch, router],
	)

	return { switchSpace }
}