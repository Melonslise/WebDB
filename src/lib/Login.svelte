<script>
	import { authorized } from "$lib/stores.js";

	let unameError = false;
	let pwdError = false;

	async function login(e)
	{
		const form = new FormData(e.target);
		const data = {};

		for(const field of form)
		{
			data[field[0]] = field[1];
		}

		unameError = !data.uname;
		pwdError = !data.pwd;

		if(unameError || pwdError)
		{
			return;
		}

		const response = await fetch("/api/auth/login",
		{
			method: "POST",
			body: JSON.stringify(data),
			headers: { "Content-Type": "application/json" }
		});

		if(!response.ok)
		{
			unameError = true;
			pwdError = true;
			return;
		}

		authorized.set(true);
	}
</script>

<div id = "login-window">
	<div id = "header">
		Login
	</div>
	<div id = "body">
		<form id = "login-form" on:submit|preventDefault = {login}>
			<input id = "username" class:error = {unameError} name = "uname" placeholder = "username">
			<input id = "password" class:error = {pwdError} type = "password" name = "pwd" placeholder = "password">
			<button type = "submit">Login</button>
		</form>
	</div>
</div>

<style>
	#login-window
	{
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 400px;
		height: 300px;
	}

	#header
	{
		width: 100%;
		height: 60px;

		padding: 15px 10%;

		border-radius: 10px 10px 0px 0px;
		background: #36304a;

		font-size: 20px;
		color: #fff;
	}

	#body
	{
		width: 100%;
		height: calc(100% - 60px);

		background-color: white;
		border-radius: 0px 0px 10px 10px;
	}

	#login-form
	{
		width: 80%;
		height: 70%;

		position:relative;
		top: 15%;
		left: 10%;
	}

	input
	{
		width: 100%;
		height: 32px;

		margin: 10px 0px;
		padding: 0px 15px;

		background: #f5f5f5;
		border: none;
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
		outline: none;
	}

	input.error
	{
		border-bottom: 1px solid rgba(255, 0, 0, 1);
	}

	button
	{
		position: absolute;
		left: 0%;
		bottom: 0%;

		width: 100%;
		height: 32px;

		border: 1px solid #36304a;
		border-radius: 8px;
		background-color: transparent;
		cursor:pointer;
	}

	button:active
	{
		transform: translateY(2px);
	}
</style>