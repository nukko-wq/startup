interface IconProps extends React.SVGProps<SVGSVGElement> {
	variant?: 'google' | 'drive' | 'docs' | 'sheets' | 'slides' | 'forms'
}

const IconGoogle = ({ variant = 'google', ...props }: IconProps) => {
	switch (variant) {
		case 'drive':
			return (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					width="112"
					height="100"
					viewBox="0 0 112 100"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					{...props}
				>
					<g clipPath="url(#clip0_1:142)">
						<path
							d="M8.46154 85.7051L13.3974 94.2308C14.4231 96.0256 15.8974 97.4359 17.6282 98.4615L35.2564 67.9487H0C0 69.9359 0.512821 71.9231 1.53846 73.7179L8.46154 85.7051Z"
							fill="#0066DA"
						/>
						<path
							d="M55.9615 32.0513L38.3333 1.53846C36.6026 2.5641 35.1282 3.97436 34.1026 5.76923L1.53846 62.1795C0.531683 63.9357 0.00134047 65.9244 0 67.9487H35.2564L55.9615 32.0513Z"
							fill="#00AC47"
						/>
						<path
							d="M94.2949 98.4615C96.0256 97.4359 97.5 96.0256 98.5256 94.2308L100.577 90.7051L110.385 73.7179C111.41 71.9231 111.923 69.9359 111.923 67.9487H76.6641L84.1667 82.6923L94.2949 98.4615Z"
							fill="#EA4335"
						/>
						<path
							d="M55.9615 32.0513L73.5898 1.53846C71.859 0.512821 69.8718 0 67.8205 0H44.1026C42.0513 0 40.0641 0.576923 38.3333 1.53846L55.9615 32.0513Z"
							fill="#00832D"
						/>
						<path
							d="M76.6667 67.9487H35.2564L17.6282 98.4615C19.359 99.4872 21.3462 100 23.3974 100H88.5256C90.5769 100 92.5641 99.4231 94.2949 98.4615L76.6667 67.9487Z"
							fill="#2684FC"
						/>
						<path
							d="M94.1026 33.9744L77.8205 5.76923C76.7949 3.97436 75.3205 2.5641 73.5897 1.53846L55.9615 32.0513L76.6667 67.9487H111.859C111.859 65.9615 111.346 63.9744 110.321 62.1795L94.1026 33.9744Z"
							fill="#FFBA00"
						/>
					</g>
					<defs>
						<clipPath id="clip0_1:142">
							<rect width="111.923" height="100" fill="white" />
						</clipPath>
					</defs>
				</svg>
			)

		case 'docs':
			return (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					width="73"
					height="100"
					viewBox="0 0 73 100"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					{...props}
				>
					<g clipPath="url(#clip0_1:149)">
						<mask
							id="mask0_1:149"
							style={{ maskType: 'alpha' }}
							maskUnits="userSpaceOnUse"
							x="0"
							y="0"
							width="73"
							height="100"
						>
							<path
								d="M45.1923 0H6.77885C3.05048 0 0 3.06818 0 6.81818V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V27.2727L45.1923 0Z"
								fill="white"
							/>
						</mask>
						<g mask="url(#mask0_1:149)">
							<path
								d="M45.1923 0H6.77885C3.05048 0 0 3.06818 0 6.81818V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V27.2727L56.4904 15.9091L45.1923 0Z"
								fill="#4285F4"
							/>
						</g>
						<mask
							id="mask1_1:149"
							style={{ maskType: 'alpha' }}
							maskUnits="userSpaceOnUse"
							x="0"
							y="0"
							width="73"
							height="100"
						>
							<path
								d="M45.1923 0H6.77885C3.05048 0 0 3.06818 0 6.81818V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V27.2727L45.1923 0Z"
								fill="white"
							/>
						</mask>
						<g mask="url(#mask1_1:149)">
							<path
								d="M47.1751 25.2784L72.3077 50.5511V27.2727L47.1751 25.2784Z"
								fill="url(#paint0_linear_1:149)"
							/>
						</g>
						<mask
							id="mask2_1:149"
							style={{ maskType: 'alpha' }}
							maskUnits="userSpaceOnUse"
							x="0"
							y="0"
							width="73"
							height="100"
						>
							<path
								d="M45.1923 0H6.77885C3.05048 0 0 3.06818 0 6.81818V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V27.2727L45.1923 0Z"
								fill="white"
							/>
						</mask>
						<g mask="url(#mask2_1:149)">
							<path
								d="M18.0769 72.7273H54.2308V68.1818H18.0769V72.7273ZM18.0769 81.8182H45.1923V77.2727H18.0769V81.8182ZM18.0769 50V54.5455H54.2308V50H18.0769ZM18.0769 63.6364H54.2308V59.0909H18.0769V63.6364Z"
								fill="#F1F1F1"
							/>
						</g>
						<mask
							id="mask3_1:149"
							style={{ maskType: 'alpha' }}
							maskUnits="userSpaceOnUse"
							x="0"
							y="0"
							width="73"
							height="100"
						>
							<path
								d="M45.1923 0H6.77885C3.05048 0 0 3.06818 0 6.81818V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V27.2727L45.1923 0Z"
								fill="white"
							/>
						</mask>
						<g mask="url(#mask3_1:149)">
							<path
								d="M45.1923 0V20.4545C45.1923 24.2216 48.2258 27.2727 51.9712 27.2727H72.3077L45.1923 0Z"
								fill="#A1C2FA"
							/>
						</g>
						<mask
							id="mask4_1:149"
							style={{ maskType: 'alpha' }}
							maskUnits="userSpaceOnUse"
							x="0"
							y="0"
							width="73"
							height="100"
						>
							<path
								d="M45.1923 0H6.77885C3.05048 0 0 3.06818 0 6.81818V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V27.2727L45.1923 0Z"
								fill="white"
							/>
						</mask>
						<g mask="url(#mask4_1:149)">
							<path
								d="M6.77885 0C3.05048 0 0 3.06818 0 6.81818V7.38636C0 3.63636 3.05048 0.568182 6.77885 0.568182H45.1923V0H6.77885Z"
								fill="white"
								fillOpacity="0.2"
							/>
						</g>
						<mask
							id="mask5_1:149"
							style={{ maskType: 'alpha' }}
							maskUnits="userSpaceOnUse"
							x="0"
							y="0"
							width="73"
							height="100"
						>
							<path
								d="M45.1923 0H6.77885C3.05048 0 0 3.06818 0 6.81818V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V27.2727L45.1923 0Z"
								fill="white"
							/>
						</mask>
						<g mask="url(#mask5_1:149)">
							<path
								d="M65.5288 99.4318H6.77885C3.05048 99.4318 0 96.3636 0 92.6136V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V92.6136C72.3077 96.3636 69.2572 99.4318 65.5288 99.4318Z"
								fill="#1A237E"
								fillOpacity="0.2"
							/>
						</g>
						<mask
							id="mask6_1:149"
							style={{ maskType: 'alpha' }}
							maskUnits="userSpaceOnUse"
							x="0"
							y="0"
							width="73"
							height="100"
						>
							<path
								d="M45.1923 0H6.77885C3.05048 0 0 3.06818 0 6.81818V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V27.2727L45.1923 0Z"
								fill="white"
							/>
						</mask>
						<g mask="url(#mask6_1:149)">
							<path
								d="M51.9712 27.2727C48.2258 27.2727 45.1923 24.2216 45.1923 20.4545V21.0227C45.1923 24.7898 48.2258 27.8409 51.9712 27.8409H72.3077V27.2727H51.9712Z"
								fill="#1A237E"
								fillOpacity="0.1"
							/>
						</g>
						<path
							d="M45.1923 0H6.77885C3.05048 0 0 3.06818 0 6.81818V93.1818C0 96.9318 3.05048 100 6.77885 100H65.5288C69.2572 100 72.3077 96.9318 72.3077 93.1818V27.2727L45.1923 0Z"
							fill="url(#paint1_radial_1:149)"
						/>
					</g>
					<defs>
						<linearGradient
							id="paint0_linear_1:149"
							x1="59.7428"
							y1="27.4484"
							x2="59.7428"
							y2="50.5547"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#1A237E" stopOpacity="0.2" />
							<stop offset="1" stopColor="#1A237E" stopOpacity="0.02" />
						</linearGradient>
						<radialGradient
							id="paint1_radial_1:149"
							cx="0"
							cy="0"
							r="1"
							gradientUnits="userSpaceOnUse"
							gradientTransform="translate(2.29074 1.9765) scale(116.595)"
						>
							<stop stopColor="white" stopOpacity="0.1" />
							<stop offset="1" stopColor="white" stopOpacity="0" />
						</radialGradient>
						<clipPath id="clip0_1:149">
							<rect width="72.3077" height="100" fill="white" />
						</clipPath>
					</defs>
				</svg>
			)

		case 'sheets':
			return (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					width="74"
					height="100"
					viewBox="0 0 74 100"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					{...props}
				>
					<mask
						id="mask0_1:52"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="1"
						y="1"
						width="71"
						height="98"
					>
						<path
							d="M45.398 1.43036H7.86688C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V27.9229L45.398 1.43036Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask0_1:52)">
						<path
							d="M45.398 1.43036H7.86688C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V27.9229L56.4365 16.8843L45.398 1.43036Z"
							fill="#0F9D58"
						/>
					</g>
					<mask
						id="mask1_1:52"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="1"
						y="1"
						width="71"
						height="98"
					>
						<path
							d="M45.398 1.43036H7.86688C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V27.9229L45.398 1.43036Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask1_1:52)">
						<path
							d="M18.9054 48.8962V80.908H54.2288V48.8962H18.9054ZM34.3594 76.4926H23.3209V70.9733H34.3594V76.4926ZM34.3594 67.6617H23.3209V62.1424H34.3594V67.6617ZM34.3594 58.8309H23.3209V53.3116H34.3594V58.8309ZM49.8134 76.4926H38.7748V70.9733H49.8134V76.4926ZM49.8134 67.6617H38.7748V62.1424H49.8134V67.6617ZM49.8134 58.8309H38.7748V53.3116H49.8134V58.8309Z"
							fill="#F1F1F1"
						/>
					</g>
					<mask
						id="mask2_1:52"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="1"
						y="1"
						width="71"
						height="98"
					>
						<path
							d="M45.398 1.43036H7.86688C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V27.9229L45.398 1.43036Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask2_1:52)">
						<path
							d="M47.3352 25.9856L71.8905 50.5354V27.9229L47.3352 25.9856Z"
							fill="url(#paint0_linear_1:52)"
						/>
					</g>
					<mask
						id="mask3_1:52"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="1"
						y="1"
						width="71"
						height="98"
					>
						<path
							d="M45.398 1.43036H7.86688C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V27.9229L45.398 1.43036Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask3_1:52)">
						<path
							d="M45.398 1.43036V21.2998C45.398 24.959 48.3618 27.9229 52.0211 27.9229H71.8905L45.398 1.43036Z"
							fill="#87CEAC"
						/>
					</g>
					<mask
						id="mask4_1:52"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="1"
						y="1"
						width="71"
						height="98"
					>
						<path
							d="M45.398 1.43036H7.86688C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V27.9229L45.398 1.43036Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask4_1:52)">
						<path
							d="M7.86688 1.43036C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V8.60542C1.24374 4.9627 4.22415 1.98229 7.86688 1.98229H45.398V1.43036H7.86688Z"
							fill="white"
							fillOpacity="0.2"
						/>
					</g>
					<mask
						id="mask5_1:52"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="1"
						y="1"
						width="71"
						height="98"
					>
						<path
							d="M45.398 1.43036H7.86688C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V27.9229L45.398 1.43036Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask5_1:52)">
						<path
							d="M65.2674 98.0177H7.86688C4.22415 98.0177 1.24374 95.0373 1.24374 91.3946V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V91.3946C71.8905 95.0373 68.9101 98.0177 65.2674 98.0177Z"
							fill="#263238"
							fillOpacity="0.2"
						/>
					</g>
					<mask
						id="mask6_1:52"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="1"
						y="1"
						width="71"
						height="98"
					>
						<path
							d="M45.398 1.43036H7.86688C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V27.9229L45.398 1.43036Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask6_1:52)">
						<path
							d="M52.0211 27.9229C48.3618 27.9229 45.398 24.959 45.398 21.2998V21.8517C45.398 25.511 48.3618 28.4748 52.0211 28.4748H71.8905V27.9229H52.0211Z"
							fill="#263238"
							fillOpacity="0.1"
						/>
					</g>
					<path
						d="M45.398 1.43036H7.86688C4.22415 1.43036 1.24374 4.41077 1.24374 8.0535V91.9465C1.24374 95.5893 4.22415 98.5697 7.86688 98.5697H65.2674C68.9101 98.5697 71.8905 95.5893 71.8905 91.9465V27.9229L45.398 1.43036Z"
						fill="url(#paint1_radial_1:52)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_1:52"
							x1="59.6142"
							y1="28.0935"
							x2="59.6142"
							y2="50.5388"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#263238" stopOpacity="0.2" />
							<stop offset="1" stopColor="#263238" stopOpacity="0.02" />
						</linearGradient>
						<radialGradient
							id="paint1_radial_1:52"
							cx="0"
							cy="0"
							r="1"
							gradientUnits="userSpaceOnUse"
							gradientTransform="translate(3.48187 3.36121) scale(113.917)"
						>
							<stop stopColor="white" stopOpacity="0.1" />
							<stop offset="1" stopColor="white" stopOpacity="0" />
						</radialGradient>
					</defs>
				</svg>
			)

		case 'forms':
			return (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					width="73"
					height="100"
					viewBox="0 0 73 100"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					{...props}
				>
					<mask
						id="mask0_1:97"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask0_1:97)">
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L56.029 15.6881L44.8232 0Z"
							fill="#673AB7"
						/>
					</g>
					<mask
						id="mask1_1:97"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask1_1:97)">
						<path
							d="M29.1351 76.1995H53.7879V71.7172H29.1351V76.1995ZM29.1351 49.3056V53.7879H53.7879V49.3056H29.1351ZM23.5322 51.5467C23.5322 53.4013 22.025 54.9085 20.1705 54.9085C18.3159 54.9085 16.8087 53.4013 16.8087 51.5467C16.8087 49.6922 18.3159 48.185 20.1705 48.185C22.025 48.185 23.5322 49.6922 23.5322 51.5467ZM23.5322 62.7525C23.5322 64.6071 22.025 66.1143 20.1705 66.1143C18.3159 66.1143 16.8087 64.6071 16.8087 62.7525C16.8087 60.898 18.3159 59.3908 20.1705 59.3908C22.025 59.3908 23.5322 60.898 23.5322 62.7525ZM23.5322 73.9583C23.5322 75.8129 22.025 77.3201 20.1705 77.3201C18.3159 77.3201 16.8087 75.8129 16.8087 73.9583C16.8087 72.1038 18.3159 70.5966 20.1705 70.5966C22.025 70.5966 23.5322 72.1038 23.5322 73.9583ZM29.1351 64.9937H53.7879V60.5114H29.1351V64.9937Z"
							fill="#F1F1F1"
						/>
					</g>
					<mask
						id="mask2_1:97"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask2_1:97)">
						<path
							d="M46.7898 24.9273L71.7172 49.849V26.8939L46.7898 24.9273Z"
							fill="url(#paint0_linear_1:97)"
						/>
					</g>
					<mask
						id="mask3_1:97"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask3_1:97)">
						<path
							d="M44.8232 0V20.1705C44.8232 23.8852 47.832 26.8939 51.5467 26.8939H71.7172L44.8232 0Z"
							fill="#B39DDB"
						/>
					</g>
					<mask
						id="mask4_1:97"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask4_1:97)">
						<path
							d="M6.72348 0C3.02557 0 0 3.02557 0 6.72348V7.28377C0 3.58586 3.02557 0.56029 6.72348 0.56029H44.8232V0H6.72348Z"
							fill="white"
							fillOpacity="0.2"
						/>
					</g>
					<mask
						id="mask5_1:97"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask5_1:97)">
						<path
							d="M64.9937 98.0508H6.72348C3.02557 98.0508 0 95.0253 0 91.3273V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V91.3273C71.7172 95.0253 68.6916 98.0508 64.9937 98.0508Z"
							fill="#311B92"
							fillOpacity="0.2"
						/>
					</g>
					<mask
						id="mask6_1:97"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask6_1:97)">
						<path
							d="M51.5467 26.8939C47.832 26.8939 44.8232 23.8852 44.8232 20.1705V20.7307C44.8232 24.4455 47.832 27.4542 51.5467 27.4542H71.7172V26.8939H51.5467Z"
							fill="#311B92"
							fillOpacity="0.1"
						/>
					</g>
					<path
						d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
						fill="url(#paint1_radial_1:97)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_1:97"
							x1="59.2549"
							y1="27.0672"
							x2="59.2549"
							y2="49.8525"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#311B92" stopOpacity="0.2" />
							<stop offset="1" stopColor="#311B92" stopOpacity="0.02" />
						</linearGradient>
						<radialGradient
							id="paint1_radial_1:97"
							cx="0"
							cy="0"
							r="1"
							gradientUnits="userSpaceOnUse"
							gradientTransform="translate(2.27204 1.9601) scale(115.643)"
						>
							<stop stopColor="white" stopOpacity="0.1" />
							<stop offset="1" stopColor="white" stopOpacity="0" />
						</radialGradient>
					</defs>
				</svg>
			)

		case 'slides':
			return (
				// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
				<svg
					width="73"
					height="100"
					viewBox="0 0 73 100"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					{...props}
				>
					<mask
						id="mask0_1:2"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask0_1:2)">
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L56.029 15.6881L44.8232 0Z"
							fill="#F4B400"
						/>
					</g>
					<mask
						id="mask1_1:2"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask1_1:2)">
						<path
							d="M50.4261 44.8232H21.291C19.4421 44.8232 17.9293 46.336 17.9293 48.185V77.3201C17.9293 79.169 19.4421 80.6818 21.291 80.6818H50.4261C52.2751 80.6818 53.7879 79.169 53.7879 77.3201V48.185C53.7879 46.336 52.2751 44.8232 50.4261 44.8232ZM49.3056 70.5966H22.4116V54.9085H49.3056V70.5966Z"
							fill="#F1F1F1"
						/>
					</g>
					<mask
						id="mask2_1:2"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask2_1:2)">
						<path
							d="M46.7899 24.9273L71.7172 49.849V26.8939L46.7899 24.9273Z"
							fill="url(#paint0_linear_1:2)"
						/>
					</g>
					<mask
						id="mask3_1:2"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask3_1:2)">
						<path
							d="M44.8232 0V20.1705C44.8232 23.8852 47.832 26.8939 51.5467 26.8939H71.7172L44.8232 0Z"
							fill="#FADA80"
						/>
					</g>
					<mask
						id="mask4_1:2"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask4_1:2)">
						<path
							d="M44.8232 0V0.56029L71.1569 26.8939H71.7172L44.8232 0Z"
							fill="white"
							fill-opacity="0.1"
						/>
					</g>
					<mask
						id="mask5_1:2"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask5_1:2)">
						<path
							d="M6.72348 0C3.02557 0 0 3.02557 0 6.72348V7.28377C0 3.58586 3.02557 0.56029 6.72348 0.56029H44.8232V0H6.72348Z"
							fill="white"
							fill-opacity="0.2"
						/>
					</g>
					<mask
						id="mask6_1:2"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask6_1:2)">
						<path
							d="M64.9937 98.0508H6.72348C3.02557 98.0508 0 95.0253 0 91.3273V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V91.3273C71.7172 95.0253 68.6916 98.0508 64.9937 98.0508Z"
							fill="#BF360C"
							fill-opacity="0.2"
						/>
					</g>
					<mask
						id="mask7_1:2"
						style={{ maskType: 'alpha' }}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="72"
						height="99"
					>
						<path
							d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask7_1:2)">
						<path
							d="M51.5467 26.8939C47.832 26.8939 44.8232 23.8852 44.8232 20.1705V20.7307C44.8232 24.4455 47.832 27.4542 51.5467 27.4542H71.7172V26.8939H51.5467Z"
							fill="#BF360C"
							fill-opacity="0.1"
						/>
					</g>
					<path
						d="M44.8232 0H6.72348C3.02557 0 0 3.02557 0 6.72348V91.8876C0 95.5855 3.02557 98.6111 6.72348 98.6111H64.9937C68.6916 98.6111 71.7172 95.5855 71.7172 91.8876V26.8939L44.8232 0Z"
						fill="url(#paint1_radial_1:2)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_1:2"
							x1="59.2549"
							y1="27.0671"
							x2="59.2549"
							y2="49.8525"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#BF360C" stopOpacity="0.2" />
							<stop offset="1" stopColor="#BF360C" stopOpacity="0.02" />
						</linearGradient>
						<radialGradient
							id="paint1_radial_1:2"
							cx="0"
							cy="0"
							r="1"
							gradientUnits="userSpaceOnUse"
							gradientTransform="translate(2.27204 1.9601) scale(115.643)"
						>
							<stop stopColor="white" stopOpacity="0.1" />
							<stop offset="1" stopColor="white" stopOpacity="0" />
						</radialGradient>
					</defs>
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
