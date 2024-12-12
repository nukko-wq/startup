import { Plus, SquarePlus } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Menu,
	MenuItem,
	MenuTrigger,
	Modal,
	ModalOverlay,
	Popover,
} from 'react-aria-components'

const WorkspaceLeftMenu = () => {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<>
			<MenuTrigger>
				<Button
					className="outline-none p-1 mr-2 group-hover:bg-gray-700 transition duration-200 rounded-full opacity-0 group-hover:opacity-100"
					aria-label="Menu"
				>
					<Plus className="w-5 h-5 text-zinc-50" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-sm shadow-md min-w-[160px]">
						<MenuItem
							className="pl-4 pr-4 py-2 outline-none hover:cursor-pointer"
							onAction={() => setIsOpen(true)}
							aria-label="New Space"
						>
							<div className="flex items-center gap-3 text-sm">
								<SquarePlus className="w-4 h-4" />
								<span>New Space</span>
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
				<Button className="hidden">Open Dialog</Button>
				<ModalOverlay className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 text-center backdrop-blur">
					<Modal className="w-full max-w-md bg-white p-6 rounded-lg align-middle shadow-xl text-left">
						<Dialog className="outline-none">
							{({ close }) => (
								<div>
									<h2 className="text-lg font-semibold mb-4">
										新しいスペースを作成
									</h2>
									{/* <SpaceCreateForm onClose={close} /> */}
								</div>
							)}
						</Dialog>
					</Modal>
				</ModalOverlay>
			</DialogTrigger>
		</>
	)
}

export default WorkspaceLeftMenu
