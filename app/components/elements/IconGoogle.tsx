interface IconProps extends React.SVGProps<SVGSVGElement> {
	variant?: 'google' | 'drive' | 'docs' | 'sheets' | 'slides' | 'forms'
}

const IconGoogle = ({ variant = 'google', ...props }: IconProps) => {
	switch (variant) {
		case 'drive':
			return (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 256 229"
					{...props}
				>
					<path
						fill="#0066DA"
						d="m19.354 196.034l11.29 19.5c2.346 4.106 5.718 7.332 9.677 9.678c11.34-14.394 19.232-25.44 23.68-33.137c4.513-7.811 10.06-20.03 16.641-36.655c-17.736-2.335-31.176-3.502-40.32-3.502c-8.777 0-22.217 1.167-40.322 3.502c0 4.545 1.173 9.09 3.519 13.196l15.835 27.418Z"
					/>
					<path
						fill="#EA4335"
						d="M215.681 225.212c3.96-2.346 7.332-5.572 9.677-9.677l4.692-8.064l22.434-38.855a26.566 26.566 0 0 0 3.518-13.196c-18.21-2.335-31.625-3.502-40.247-3.502c-9.266 0-22.682 1.167-40.248 3.502c6.503 16.716 11.977 28.935 16.422 36.655c4.483 7.789 12.4 18.834 23.752 33.137Z"
					/>
					<path
						fill="#00832D"
						d="M128.001 73.311c13.12-15.845 22.162-28.064 27.125-36.655c3.997-6.918 8.396-17.964 13.196-33.137C164.363 1.173 159.818 0 155.126 0h-54.25C96.184 0 91.64 1.32 87.68 3.519c6.106 17.402 11.288 29.787 15.544 37.154c4.704 8.142 12.963 19.021 24.777 32.638Z"
					/>
					<path
						fill="#2684FC"
						d="M175.36 155.42H80.642l-40.32 69.792c3.958 2.346 8.503 3.519 13.195 3.519h148.968c4.692 0 9.238-1.32 13.196-3.52l-40.32-69.791Z"
					/>
					<path
						fill="#00AC47"
						d="M128.001 73.311L87.681 3.52c-3.96 2.346-7.332 5.571-9.678 9.677L3.519 142.224A26.567 26.567 0 0 0 0 155.42h80.642l47.36-82.109Z"
					/>
					<path
						fill="#FFBA00"
						d="m215.242 77.71l-37.243-64.514c-2.345-4.106-5.718-7.331-9.677-9.677l-40.32 69.792l47.358 82.109h80.496c0-4.546-1.173-9.09-3.519-13.196L215.242 77.71Z"
					/>
				</svg>
			)

		case 'docs':
			return (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 48 48"
					{...props}
				>
					<defs>
						<linearGradient
							id="docs_gradient1"
							x1="-209.942"
							x2="-179.36"
							y1="-3.055"
							y2="27.526"
							gradientTransform="translate(208.979 6.006)"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stopColor="#55adfd" />
							<stop offset="1" stopColor="#438ffd" />
						</linearGradient>
						<linearGradient
							id="docs_gradient2"
							x1="-197.862"
							x2="-203.384"
							y1="-4.632"
							y2=".89"
							gradientTransform="translate(234.385 12.109)"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stopColor="#427fdb" />
							<stop offset="1" stopColor="#0c52bb" />
						</linearGradient>
					</defs>
					<path
						fill="url(#docs_gradient1)"
						d="M39.001,13.999v27c0,1.105-0.896,2-2,2h-26c-1.105,0-2-0.895-2-2v-34c0-1.104,0.895-2,2-2h19l2,7L39.001,13.999z"
					/>
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M15.999,18.001v2.999h17.002v-2.999H15.999z"
					/>
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M16.001,24.001v2.999h17.002v-2.999H16.001z"
					/>
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M15.999,30.001v2.999h12.001v-2.999H15.999z"
					/>
					<path
						fill="url(#docs_gradient2)"
						d="M30.001,13.999l0.001-9l8.999,8.999L30.001,13.999z"
					/>
				</svg>
			)

		case 'sheets':
			return (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					x="0px"
					y="0px"
					width="100"
					height="100"
					viewBox="0 0 48 48"
					{...props}
				>
					<linearGradient
						id="gBjrhQfVvaLo6qORHi0_9a_6yIWVyFTE0no_gr1"
						x1="24"
						x2="24"
						y1="-166.87"
						y2="-248.839"
						gradientTransform="matrix(1 0 0 -1 0 -154)"
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0" stopColor="#21ad64" />
						<stop offset="1" stopColor="#088242" />
					</linearGradient>
					<path
						fill="url(#gBjrhQfVvaLo6qORHi0_9a_6yIWVyFTE0no_gr1)"
						d="M39,15v27c0,1.105-0.895,2-2,2H11c-1.105,0-2-0.895-2-2V6c0-1.105,0.895-2,2-2h17L39,15z"
					/>
					<path fill="#107c42" d="M28,4v10c0,0.552,0.448,1,1,1h10L28,4z" />
					<path
						d="M16,33c-1.103,0-2-0.897-2-2V21c0-1.103,0.897-2,2-2h16c1.103,0,2,0.897,2,2v10c0,1.103-0.897,2-2,2	H16z M30,29v-1h-4v1H30z M22,29v-1h-4v1H22z M30,24v-1h-4v1H30z M22,24v-1h-4v1H22z"
						opacity=".05"
					/>
					<path
						d="M16,32.5c-0.827,0-1.5-0.673-1.5-1.5V21c0-0.827,0.673-1.5,1.5-1.5h16c0.827,0,1.5,0.673,1.5,1.5v10	c0,0.827-0.673,1.5-1.5,1.5H16z M30.5,29.5v-2h-5v2H30.5z M22.5,29.5v-2h-5v2H22.5z M30.5,24.5v-2h-5v2H30.5z M22.5,24.5v-2h-5v2	H22.5z"
						opacity=".07"
					/>
					<path
						fill="#fff"
						d="M32,20H16c-0.553,0-1,0.448-1,1v10c0,0.552,0.447,1,1,1h16c0.553,0,1-0.448,1-1V21	C33,20.448,32.553,20,32,20z M31,25h-6v-3h6V25z M23,22v3h-6v-3H23z M17,27h6v3h-6V27z M25,30v-3h6v3H25z"
					/>
				</svg>
			)

		case 'forms':
			return (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					x="0px"
					y="0px"
					width="100"
					height="100"
					viewBox="0 0 48 48"
					{...props}
				>
					<linearGradient
						id="00wCqH7f0ElurH3hbcIXXa_E4VmOrv6BZqd_gr1"
						x1="-208.197"
						x2="-180.197"
						y1="-150.795"
						y2="-122.795"
						gradientTransform="translate(215.243 161.751)"
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0" stopColor="#a235d4" />
						<stop offset="1" stopColor="#831bb3" />
					</linearGradient>
					<path
						fill="url(#00wCqH7f0ElurH3hbcIXXa_E4VmOrv6BZqd_gr1)"
						d="M39.004,13.999v27c0,1.105-0.895,2-2,2h-26	c-1.105,0-2-0.895-2-2v-34c0-1.104,0.895-2,2-2h19.002l1.997,7L39.004,13.999z"
					/>
					<path
						fill="#ce97e6"
						fillRule="evenodd"
						d="M30.002,11.999l0.003-7	l8.999,8.999l-7.001,0.001L30.002,11.999z"
						clipRule="evenodd"
					/>
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M21.001,21.999v2.001	h10.001v-2.001H21.001z"
						clipRule="evenodd"
					/>
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M18.002,21.558	c0.795,0,1.44,0.647,1.44,1.441c0,0.795-0.645,1.441-1.44,1.441c-0.795,0-1.44-0.647-1.44-1.441	C16.562,22.205,17.207,21.558,18.002,21.558z"
						clipRule="evenodd"
					/>
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M21.001,26.999v2.001	h10.001v-2.001H21.001z"
						clipRule="evenodd"
					/>
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M18.002,26.558	c0.795,0,1.44,0.647,1.44,1.441c0,0.795-0.645,1.441-1.44,1.441c-0.795,0-1.44-0.647-1.44-1.441	C16.562,27.205,17.207,26.558,18.002,26.558z"
						clipRule="evenodd"
					/>
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M21.001,31.999v2.001	h10.001v-2.001H21.001z"
						clipRule="evenodd"
					/>
					<path
						fill="#fff"
						fillRule="evenodd"
						d="M18.002,31.558	c0.795,0,1.44,0.647,1.44,1.441c0,0.795-0.645,1.441-1.44,1.441c-0.795,0-1.44-0.647-1.44-1.441	C16.562,32.205,17.207,31.558,18.002,31.558z"
						clipRule="evenodd"
					/>
					<path
						fill="#ce97e6"
						fillRule="evenodd"
						d="M32.002,9.998	c1.104,0,2.001,0.897,2.001,2.001s-0.897,2.001-2.001,2.001s-2.001-0.897-2.001-2.001S30.898,9.998,32.002,9.998z"
						clipRule="evenodd"
					/>
				</svg>
			)
		default:
			return (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="22"
					height="22"
					viewBox="0 0 48 48"
					aria-label="Google Logo"
					role="img"
					{...props}
				>
					<path
						fill="#FFC107"
						d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
					/>
					<path
						fill="#FF3D00"
						d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
					/>
					<path
						fill="#4CAF50"
						d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
					/>
					<path
						fill="#1976D2"
						d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
					/>
				</svg>
			)
	}
}

export default IconGoogle
