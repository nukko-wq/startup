import ResourceCreateButton from '@/app/features/resources/create_resource/components/ResourceCreateButton'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import ResourceItem from '@/app/features/resources/components/ResourceItem'
import { File } from 'lucide-react'
import { ResourceProvider } from '@/app/features/resources/contexts/ResourceContext'

const Resources = async () => {
	const user = await getCurrentUser()

	if (!user) {
		redirect('/login')
	}

	const resources = await db.resource.findMany({
		where: {
			userId: user.id,
		},
		select: {
			id: true,
			title: true,
			description: true,
			url: true,
			faviconUrl: true,
			position: true,
			createdAt: true,
			mimeType: true,
			isGoogleDrive: true,
		},
		orderBy: {
			position: 'asc',
		},
	})

	return (
		<ResourceProvider initialResources={resources}>
			<div className="min-w-[260px] max-w-[920px] w-full p-5">
				<div className="flex justify-between items-center mb-2">
					<div className="flex items-center gap-2 ml-4">
						<File className="w-6 h-6 text-zinc-700" />
						<div className="text-xl font-semibold text-zinc-700">Resources</div>
					</div>
					<div className="">
						<ResourceCreateButton />
					</div>
				</div>
				<div className="flex flex-col border rounded-md">
					<ResourceItem />
				</div>
			</div>
		</ResourceProvider>
	)
}

export default Resources
