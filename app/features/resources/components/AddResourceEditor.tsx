const AddResourceEditor = () => {
	return (
		<div>
			<h2>Add Resource</h2>
			<form>
				<div>
					<div>
						<input type="text" id="url" placeholder="URL" />
					</div>
					<div>
						<input type="text" id="name" placeholder="Name" />
					</div>
					<button type="submit">
						<span>ADD RESOURCE</span>
					</button>
				</div>
			</form>
		</div>
	)
}

export default AddResourceEditor
