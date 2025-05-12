'use client'

import SignInButton from '@/app/features/auth/components/SignInButton'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Form } from 'react-aria-components'

export default function SignInForm() {
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		try {
			const result = await signIn('google', {
				callbackUrl: '/',
				redirect: true,
			})
			// next-auth v5.0.0-beta.28では、signIn関数の戻り値の型が変更され
			// result.errorプロパティが存在しない可能性があります
			// リダイレクトが成功すれば、このコードは実行されません
		} catch (err) {
			setError('ログイン処理中にエラーが発生しました')
			console.error(err)
		}
	}

	return (
		<div className="w-[350px] border border-border rounded-lg">
			<Form className="flex flex-col items-center" onSubmit={handleSubmit}>
				<SignInButton />
				{error && <p className="text-red-500 mt-2">{error}</p>}
			</Form>
		</div>
	)
}
