import ResourcesCard from '@/app/features/resources/components/resources-card'
import CreateResourceButton from '@/app/features/resources/components/CreateResourceButton'
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
			position: true,
			createdAt: true,
		},
		orderBy: {
			position: 'asc',
		},
	})

	console.log(resources)

	return (
		<div>
			<div>
				<div className="text-xl font-medium">Resources</div>
				<CreateResourceButton />
			</div>
			<ResourcesCard />
			<div>
				{resources.map((resource) => (
					<ResourceItem key={resource.id} resource={resource} />
				))}
			</div>
		</div>
	)
}

export default Resources
