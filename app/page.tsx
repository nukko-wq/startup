import Sidebar from '@/app/components/layouts/sidebar/sidebar'
import Resources from '@/app/features/resources/components/resources'
import { getInitialSections } from '@/app/features/resources/utils/getInitialSections'

export default async function Index() {
	const initialData = await getInitialSections()

	return (
		<div className="flex flex-col min-h-screen">
			<div className="flex bg-slate-50 flex-grow">
				<Sidebar />
				<main className="flex flex-col flex-grow items-center justify-center">
					<Resources initialData={initialData} />
				</main>
			</div>
		</div>
	)
}
