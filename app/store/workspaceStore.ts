import { create } from 'zustand'
import type { Workspace } from '@/app/types/workspace'

interface WorkspaceStore {
	workspaces: Workspace[]
	defaultWorkspace: Workspace | null
	isLoading: boolean
	setWorkspaces: (workspaces: Workspace[]) => void
	setDefaultWorkspace: (workspace: Workspace | null) => void
	setIsLoading: (loading: boolean) => void
	initializeWorkspaces: (initialWorkspaces: Workspace[]) => void
	reorderWorkspaces: (payload: {
		items: Array<{ id: string; order: number }>
	}) => Promise<void>
	deleteWorkspace: (workspaceId: string) => Promise<void>
	renameWorkspace: (workspaceId: string, newName: string) => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
	workspaces: [],
	defaultWorkspace: null,
	isLoading: true,

	setWorkspaces: (workspaces) => set({ workspaces }),
	setDefaultWorkspace: (workspace) => set({ defaultWorkspace: workspace }),
	setIsLoading: (loading) => set({ isLoading: loading }),

	initializeWorkspaces: (initialWorkspaces) => {
		const defaultWorkspace = initialWorkspaces.find((w) => w.isDefault) || null
		set({
			workspaces: initialWorkspaces,
			defaultWorkspace,
			isLoading: false,
		})
	},

	reorderWorkspaces: async (payload) => {
		const { workspaces: previousWorkspaces } = get()
		set({ isLoading: true })

		try {
			const response = await fetch('/api/workspaces/reorder', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				throw new Error('ワークスペースの並び替えに失敗しました')
			}

			const data = await response.json()
			if (data.success && data.data) {
				set({ workspaces: data.data })
			}
		} catch (error) {
			console.error('Reorder error:', error)
			set({ workspaces: previousWorkspaces })
		} finally {
			set({ isLoading: false })
		}
	},

	deleteWorkspace: async (workspaceId: string) => {
		const { workspaces, setWorkspaces } = get()
		const previousWorkspaces = [...workspaces]

		setWorkspaces(workspaces.filter((w) => w.id !== workspaceId))

		try {
			const response = await fetch(`/api/workspaces/${workspaceId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				setWorkspaces(previousWorkspaces)
				throw new Error('ワークスペースの削除に失敗しました')
			}
		} catch (error) {
			console.error('Delete error:', error)
			setWorkspaces(previousWorkspaces)
			throw error
		}
	},

	renameWorkspace: async (workspaceId: string, newName: string) => {
		const { workspaces, setWorkspaces } = get()
		const previousWorkspaces = [...workspaces]

		try {
			const response = await fetch(`/api/workspaces/${workspaceId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newName }),
			})

			if (!response.ok) {
				throw new Error('ワークスペースの名前変更に失敗しました')
			}

			const updatedWorkspace = await response.json()
			setWorkspaces(
				workspaces.map((w) =>
					w.id === workspaceId ? { ...w, name: updatedWorkspace.name } : w,
				),
			)
		} catch (error) {
			console.error('Rename error:', error)
			setWorkspaces(previousWorkspaces)
			throw error
		}
	},
}))
