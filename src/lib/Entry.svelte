<script>
	import { authorized, role } from "$lib/stores.js";

	/*
	*
	* Tabs
	*
	*/

	let isRegisterTab = false;

	function selectTab(reg)
	{
		if(isRegisterTab === reg)
		{
			return;
		}

		isRegisterTab = reg;

		errors.uname = false;
		errors.pwd = false;
		registered = false;
	}

	function selectRegisterTab()
	{
		selectTab(true);
	}

	function selectLoginTab()
	{
		selectTab(false);
	}

	/*
	*
	* Form stuff
	*
	*/

	let errors = { uname: false, pwd: false };

	let registered = false;

	async function submit(e)
	{
		const data = parseForm(e);

		errors.uname = !data.uname;
		errors.pwd = !data.pwd;

		registered = false;

		if(hasError(errors))
		{
			return;
		}

		const registering = isRegisterTab; // cache for later in case it changes during await

		const response = await fetch("/api/auth/" + (registering ? "register" : "login"),
		{
			method: "POST",
			body: JSON.stringify(data),
			headers: { "Content-Type": "application/json" }
		});

		if(!response.ok)
		{
			errors.uname = true;

			if(!registering)
			{
				errors.pwd = true;
			}

			return;
		}

		const body = await response.json();
		
		if(response.ok)
		{
			role.set(body.role);
		}

		if(!registering)
		{
			authorized.set(true);
		}
		else
		{
			registered = true;
		}
	}

	/*
	*
	* Util
	*
	*/

	function parseForm(e)
	{
		const form = new FormData(e.target);
		const data = {};

		for(const field of form)
		{
			data[field[0]] = field[1];
		}

		return data;
	}

	function hasError(e)
	{
		for(const name in e)
		{
			if(e[name])
			{
				return true;
			}
		}

		return false;
	}
</script>

<div id = "entry">
	<div id = "header">
		<div class = "tab" class:selected = {!isRegisterTab} on:click = {selectLoginTab}>Login</div><div class = "tab" class:selected = {isRegisterTab} on:click = {selectRegisterTab}>Register</div>
	</div>
	<div id = "body">
		<form id = "form" on:submit|preventDefault = {submit}>
			<input id = "username" class:error = {errors.uname} class:success = {registered} name = "uname" placeholder = "Username">
			<input id = "password" class:error = {errors.pwd} class:success = {registered} type = "password" name = "pwd" placeholder = "Password">
			<button type = "submit">{isRegisterTab ? "Register" : "Login"}</button>
		</form>
	</div>
</div>

<style>
	#entry
	{
		width: 400px;
		height: 300px;

		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	#header
	{
		width: 100%;
		height: 60px;

		padding: 0px;
		margin: 0px;

		background: #36304a;

		border-radius: 10px 10px 0px 0px;

		font-size: 20px;
	}

	#body
	{
		width: 100%;
		height: calc(100% - 60px);

		background-color: white;

		border-radius: 0px 0px 10px 10px;
	}

	#form
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

	input.success
	{
		border-bottom: 1px solid rgba(0, 192, 0, 1);
	}

	.tab
	{
		height: 60px;
		width: 50%;

		margin: 0px;
		padding: 15px;

		border-radius: 10px 10px 0px 0px;
		border: none;

		color: #fff;
		text-align: center;

		display: inline-block;

		cursor: pointer;
	}

	.tab.selected
	{
		background: white;

		color: black;

		cursor: auto;
	}

	button
	{
		width: 100%;
		height: 32px;

		position: absolute;
		left: 0%;
		bottom: 0%;
		
		background-color: transparent;

		border: 1px solid #36304a;
		border-radius: 8px;

		cursor: pointer;
	}

	button:active
	{
		transform: translateY(2px);
	}
</style>