<script>
	import { authorized } from "$lib/stores.js";

	async function logout()
	{
		const response = await fetch("/api/auth/logout",
		{
			method: "POST"
		});
		
		const res = await response.json();

		authorized.set(false);
	}
</script>

<button on:click = {logout}>Logout</button>

<style>
	button
	{
		position: absolute;
		right: 0%;
		top: 0%;

		width: 64px;
		height: 32px;

		margin: 10px;

		border: none;
		/* 1px solid #36304a; */
		border-radius: 8px;
		background-color: white;
		cursor:pointer;
	}

	button:active
	{
		transform: translateY(2px);
	}
</style>