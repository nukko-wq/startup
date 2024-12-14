import { useState } from "react"
import { Button, Form, Input, Label, TextField } from "react-aria-components"
import { Controller } from "react-hook-form"

const SpaceRenameForm = () => {
const [isSubmitting, setIsSubmitting] = useState(false)

	return (
    <Form onSubmit={} className="space-y-4">
			<Controller
				name="name"
				control={control}
				rules={{
					required: 'スペース名は必須です',
					minLength: { value: 1, message: 'スペース名を入力してください' },
				}}
				render={({ field, fieldState }) => (
					<TextField
						isInvalid={!!fieldState.error}
						autoFocus
						className="space-y-[2px]"
					>
						<Label className="text-sm">スペース名</Label>
						<Input
							{...field}
							className="w-full px-3 py-2 border rounded focus:outline-blue-500"
						/>
						{fieldState.error && (
							<div className="text-red-500 text-sm">
								{fieldState.error.message}
							</div>
						)}
					</TextField>
				)}
			/>
			<div className="flex justify-end gap-2">
				<Button
					type="button"
					onPress={onClose}
					className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 outline-none"
					isDisabled={isSubmitting}
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 outline-none flex items-center gap-2"
					isDisabled={isSubmitting}
				>
					{isSubmitting ? '更新中...' : '保存'}
				</Button>
			</div>
		</Form>
  )
}

export default SpaceRenameForm
