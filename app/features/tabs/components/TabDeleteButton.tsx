import { X } from 'lucide-react'
import { Button } from 'react-aria-components'

interface TabDeleteButtonProps {
	tabId: number
	onDelete: (tabId: number) => Promise<void>
}

const TabDeleteButton = ({ tabId, onDelete }: TabDeleteButtonProps) => {
	const handleClick = async () => {
		await onDelete(tabId)
	}

	return (
		<Button
			onPress={handleClick}
			className="outline-none p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
			aria-label="タブを閉じる"
		>
			<X className="w-5 h-5 text-gray-700" />
		</Button>
	)
}

export default TabDeleteButton
