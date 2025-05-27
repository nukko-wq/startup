import type { DropResult } from '@hello-pangea/dnd'

/**
 * ドラッグアンドドロップの結果を検証する
 */
export const validateDropResult = (result: DropResult): boolean => {
	const { source, destination } = result

	// 移動先がない場合は無効
	if (!destination) return false

	// 同じ位置に移動した場合は無効
	if (
		source.droppableId === destination.droppableId &&
		source.index === destination.index
	) {
		return false
	}

	return true
}

/**
 * 配列の要素を移動する
 */
export const reorderArray = <T>(
	array: T[],
	sourceIndex: number,
	destinationIndex: number,
): T[] => {
	const result = Array.from(array)
	const [removed] = result.splice(sourceIndex, 1)
	result.splice(destinationIndex, 0, removed)
	return result
}

/**
 * 順序を更新する
 */
export const updateOrder = <T extends { order: number }>(items: T[]): T[] => {
	return items.map((item, index) => ({
		...item,
		order: index,
	}))
}

/**
 * エラーメッセージを標準化する
 */
export const getDragDropErrorMessage = (
	operation: 'workspace' | 'space',
	action: 'reorder' | 'move',
): string => {
	const operationText =
		operation === 'workspace' ? 'ワークスペース' : 'スペース'
	const actionText = action === 'reorder' ? '並び替え' : '移動'

	return `${operationText}の${actionText}に失敗しました`
}

/**
 * ドラッグアンドドロップ操作のログを出力する
 */
export const logDragDropOperation = (
	operation: string,
	details: Record<string, unknown>,
): void => {
	if (process.env.NODE_ENV === 'development') {
		console.log(`[DragDrop] ${operation}:`, details)
	}
}

/**
 * 楽観的更新のエラーハンドリング
 */
export const handleOptimisticUpdateError = (
	error: unknown,
	operation: string,
	restoreCallback: () => void,
): void => {
	console.error(`${operation}でエラーが発生しました:`, error)
	restoreCallback()

	// 必要に応じてユーザーに通知
	if (process.env.NODE_ENV === 'development') {
		console.warn('楽観的更新が失敗したため、前の状態に復元しました')
	}
}
