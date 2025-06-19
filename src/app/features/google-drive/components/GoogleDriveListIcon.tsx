import IconGoogle from '@/app/components/elements/IconGoogle'

interface GoogleDriveListIconProps {
	mimeType: string
	className?: string
}

const GoogleDriveListIcon = ({
	mimeType,
	className,
}: GoogleDriveListIconProps) => {
	const getIconVariant = (mimeType: string) => {
		switch (mimeType) {
			case 'application/vnd.google-apps.document':
				return 'docs'
			case 'application/vnd.google-apps.spreadsheet':
				return 'sheets'
			case 'application/vnd.google-apps.presentation':
				return 'slides'
			case 'application/vnd.google-apps.form':
				return 'forms'
			default:
				return 'drive'
		}
	}

	return (
		<IconGoogle
			variant={getIconVariant(mimeType)}
			className={className || 'w-[20px] h-[20px]'}
		/>
	)
}

export default GoogleDriveListIcon
