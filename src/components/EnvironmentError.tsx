/**
 * Environment Error Component
 * Displays when required environment variables are missing
 */

export default function EnvironmentError() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
				<div className="text-center">
					<div className="text-6xl mb-4">🚨</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Configuration Error
					</h1>
					<p className="text-gray-600 mb-6">
						This application is missing required environment variables.
					</p>
					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
						<h3 className="font-semibold text-yellow-800 mb-2">
							For Administrators:
						</h3>
						<ol className="text-yellow-700 text-sm space-y-1">
							<li>1. Go to your Vercel dashboard</li>
							<li>2. Navigate to project settings</li>
							<li>3. Add environment variables:</li>
							<ul className="ml-4 mt-1 space-y-1">
								<li>• AUTH_SECRET</li>
								<li>• AUTH_URL</li>
								<li>• AUTH_GOOGLE_ID</li>
								<li>• AUTH_GOOGLE_SECRET</li>
								<li>• DATABASE_URL</li>
								<li>• DIRECT_URL</li>
								<li>• ALLOWED_EMAILS</li>
							</ul>
							<li>4. Redeploy the application</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	)
}