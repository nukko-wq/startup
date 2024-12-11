import { redirect } from 'next/navigation'

export default function Home() {
	return (
		<div className="flex w-full h-full">
			<div className="flex flex-col w-full h-full">
				<div className="grid grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr] bg-slate-50">
					<main className="flex flex-col flex-grow items-center bg-slate-100">
						<div className="flex flex-grow w-full h-[calc(100vh-68px)]">
							<div className="flex justify-center w-1/2">Tab List</div>
							<div className="flex justify-center w-1/2">Section List</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	)
}
