export default function LoadingSpinner() {
	return (
		<div className="flex flex-col items-center justify-center flex-grow">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
			<div className="mt-4 text-gray-600">Loading resources...</div>
		</div>
	)
}
