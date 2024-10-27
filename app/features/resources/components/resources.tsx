import ResourceCreateButton from '@/app/features/resources/components/ResourceCreateButton'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import ResourceItem from '@/app/features/resources/components/ResourceItem'

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
			position: true,
			createdAt: true,
		},
		orderBy: {
			position: 'asc',
		},
	})

	console.log(resources)

	return (
		<div className="min-w-[260px] max-w-[920px] w-full">
			<div>
				<div className="text-xl font-semibold">Resources</div>
				<ResourceCreateButton />
			</div>
			<div className="flex flex-col border rounded-md">
				{resources.map((resource) => (
					<ResourceItem key={resource.id} resource={resource} />
				))}
			</div>
		</div>
	)
}

export default Resources
