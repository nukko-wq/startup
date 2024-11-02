'use client'

import { ResourceProvider } from '@/app/features/resources/contexts/ResourceContext'
import { Button } from 'react-aria-components'
import Section from '@/app/features/sections/components/Section'
import type { getInitialSections } from '@/app/features/resources/utils/getInitialSections'
interface ResourceProps {
	initialData: Awaited<ReturnType<typeof getInitialSections>>
}

const Resources = ({
	initialData,
}: { initialData: Awaited<ReturnType<typeof getInitialSections>> }) => {
	const { sections, userId } = initialData

	// 重複を排除して初期リソースを作成
	const uniqueResources = Array.from(
		new Map(
			sections
				.flatMap((s) => s.resources)
				.map((resource) => [resource.id, resource]),
		).values(),
	)

	return (
		<ResourceProvider initialResources={sections.flatMap((s) => s.resources)}>
			<div className="flex flex-col w-full">
				<div className="flex flex-col w-full items-center">
					{sections.map((section) => (
						<Section key={section.id} id={section.id} name={section.name} />
					))}
				</div>
				<div className="flex justify-center">
					<div className="flex justify-center">
						<Button
							className="flex items-center gap-2 px-4 py-2"
							onPress={async () => {
								// TODO: セクション作成のロジックをサーバーアクションに移動
							}}
						>
							セクションを追加
						</Button>
					</div>
				</div>
			</div>
		</ResourceProvider>
	)
}

export default Resources
