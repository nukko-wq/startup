export default function Sidebar() {
	return (
		<div className="flex w-[320px] bg-slate-900">
			<div className="flex-grow text-white">
				<div className="flex items-center justify-between p-4">
					<div className="text-2xl font-bold">StartUp</div>
					<div>アバターアイコン</div>
				</div>
				<div className="flex flex-col gap-4 p-4">
					<div>
						<div className="text-[15px]">スペース</div>
						<div>
							<div className="text-[13px]">スペース1</div>
							<div className="text-[13px]">スペース2</div>
							<div className="text-[13px]">スペース3</div>
						</div>
					</div>
					<div className="text-[15px]">ワークスペース</div>
					<div className="text-[15px]">ワークスペース2</div>
				</div>
			</div>
		</div>
	)
}
