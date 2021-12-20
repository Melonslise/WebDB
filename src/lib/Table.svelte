<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let menuPos = { x: -1, y: -1 };

	let orders = [];

	const addErrors = {
		name: false,
		price: false,
		quantity: false,
		total: false
	};

	const editErrors = {
		name: false,
		price: false,
		quantity: false,
		total: false
	};


	let selectedOrderId;
	let editingOrder;

	async function updateOrders()
	{
		const response = await fetch("/api/orders/read");

		if(!response.ok)
		{
			return;
		}

		const body = await response.json();
		
		orders = body.orders;
	}

	onMount(updateOrders);

	function resetMenu()
	{
		menuPos.x = -1;
		menuPos.y = -1;

		selectedOrderId = null;
	}

	function click(e)
	{
		const parent = e.target.parentNode;
		if(parent.nodeName !== "BUTTON" && parent.nodeName === "TR" && parent.parentNode.nodeName === "TBODY" && parent.id !== "new-row")
		{
			menuPos.x = e.clientX;
			menuPos.y = e.clientY;

			selectedOrderId = parent.id.substring(5);

			return;
		}

		resetMenu();
	}

	async function addOrder(e)
	{
		const data = parseForm(e);

		if(!validateForm(data, addErrors))
		{
			return;
		}

		if(!data.date)
		{
			data.date = Date.now();
		}

		document.getElementById("add-form").reset();

		const response = await fetch("/api/orders/create",
		{
			method: "PUT",
			body: JSON.stringify(data),
			headers: { "Content-Type": "application/json" }
		});

		if(response.ok)
		{
			updateOrders();
		}
	}

	function editOrder()
	{
		editingOrder = orders.find(o => o.id == selectedOrderId);

		if(!editingOrder)
		{
			return;
		}

		resetMenu();
	}

	async function sendEditOrder(e)
	{
		const data = parseForm(e);

		if(!validateForm(data, editErrors))
		{
			return;
		}

		data.id = editingOrder.id;

		if(!data.date)
		{
			data.date = Date.now();
		}

		editingOrder = null;

		const response = await fetch("/api/orders/update",
		{
			method: "POST",
			body: JSON.stringify(data),
			headers: { "Content-Type": "application/json" }
		});

		if(response.ok)
		{
			updateOrders();
		}
	}

	function cancelEditOrder()
	{
		editingOrder = null;
	}

	async function deleteOrder()
	{
		const response = await fetch("/api/orders/delete",
		{
			method: "DELETE",
			body: JSON.stringify({ id: selectedOrderId }),
			headers: { "Content-Type": "application/json" }
		});

		resetMenu();
		
		if(response.ok)
		{
			updateOrders();
		}
	}

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

	function validateForm(data, errors)
	{
		let error = false;

		for(const field in errors)
		{
			errors[field] = !data[field];
			
			if(errors[field])
			{
				error = true;
			}
		}

		return !error;
	}

	function toInputDate(dateString)
	{
		const date = new Date(dateString);
		date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
		return date.toISOString().slice(0, -1);
	};
</script>

{#if menuPos.x >= 0 && menuPos.y >= 0}
	<div id = "context-menu" in:fade = {{ duration: 80 }} style = "left: {menuPos.x}px; top: {menuPos.y}px">
		<div class = "item" on:click = {editOrder}>Edit</div>
		<div class = "item" on:click = {deleteOrder}>Delete</div>
	</div>
{/if}

<svg style = "display: none">
	<defs>
		<symbol id = "plus" viewbox = "0 0 1280 1280">
			<g transform = "translate(0, 1280) scale(0.1, -0.1)" fill = "#00dd00" stroke = "none">
				<path d = "M4740 10555 l0 -2245 -2370 0 -2370 0 0 -1760 0 -1760 2370 0 2370 0 0 -2395 0 -2395 1760 0 1760 0 0 2395 0 2395 2270 0 2270 0 0 1760 0 1760 -2270 0 -2270 0 0 2245 0 2245 -1760 0 -1760 0 0 -2245z"/>
			</g>
		</symbol>
		<symbol id = "check" viewBox = "0 0 32 32">
			<g fill = "#00dd00">
				<polygon points = "11.941, 28.877 0, 16.935 5.695, 11.24 11.941, 17.486 26.305, 3.123 32, 8.818"/>
			</g>
		</symbol>
		<symbol id = "cross" viewBox = "0 0 490 490">
			<g fill = "#dd0000">
				<polygon points = "386.813, 0 245, 141.812 103.188, 0 0, 103.188 141.813, 245 0, 386.812 103.187, 489.999 245, 348.187 386.813, 490 490, 386.812 348.187, 244.999 490, 103.187"/>
			</g>
		</symbol>
	</defs>
</svg>

<div id = "body" on:click = {click}>
	<div id = "table">
		<form id = "add-form" on:submit|preventDefault = {addOrder}></form>
		<form id = "edit-form" on:submit|preventDefault = {sendEditOrder}></form>
		<table id = "main-table">
			<thead>
				<tr>
					<th class = "column1">Date</th>
					<th class = "column2">Order ID</th>
					<th class = "column3">Name</th>
					<th class = "column4">Price</th>
					<th class = "column5">Quantity</th>
					<th class = "column6">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each orders as order}
				<tr id = "order{order.id}">
					{#if order === editingOrder}
					<td class = "column1"><input type = "datetime-local" name = "date" form = "edit-form" value = {(toInputDate(order.date))} step = "1"></td>
					<td class = "column2">{order.id}</td>
					<td class = "column3"><input name = "name" form = "edit-form" value = {order.name}></td>
					<td class = "column4"><input class = "right" type = "number" name = "price" form = "edit-form" value = {order.price}></td>
					<td class = "column5"><input class = "right" type = "number" name = "quantity" form = "edit-form" value = {order.quantity}></td>
					<td class = "column6"><input class = "right" type = "number" name = "total" form = "edit-form" value = {order.total}></td>
					<button class = "button1" type = "submit" form = "edit-form">
						<svg width = "20px" height = "20px">
							<use href = "#check">
						</svg>
					</button>
					<button class = "button2" on:click = {cancelEditOrder}>
						<svg width = "20px" height = "20px">
							<use href = "#cross">
						</svg>
					</button>
					{:else}
					<td class = "column1">{new Date(order.date).toLocaleString("ru-ru")}</td>
					<td class = "column2">{order.id}</td>
					<td class = "column3">{order.name}</td>
					<td class = "column4">${order.price}</td>
					<td class = "column5">{order.quantity}</td>
					<td class = "column6">${order.total}</td>
					{/if}

				</tr>
				{/each}
				<tr id = "new-row">
					<td class = "column1"><input type = "datetime-local" name = "date" form = "add-form" step = "1"></td>
					<td class = "column2"></td>
					<td class = "column3"><input class:error = {addErrors.name} name = "name" form = "add-form"></td>
					<td class = "column4"><input class = "right" class:error = {addErrors.price} type = "number" name = "price" form = "add-form"></td>
					<td class = "column5"><input class = "right" class:error = {addErrors.quantity} type = "number" name = "quantity" form = "add-form"></td>
					<td class = "column6"><input class = "right" class:error = {addErrors.total} type = "number" name = "total" form = "add-form"></td>
					<button class = "button1" type = "submit" form = "add-form">
						<svg width = "20px" height = "20px">
							<use href = "#plus">
						</svg>
					</button>
				</tr>
			</tbody>
		</table>
	</div>
</div>

<style>
	#body
	{
		width: 100%;
		height: 100%;
	}

	#context-menu
	{
		position: absolute;
		z-index: 10000;
		width: 150px;
		background: white;
		border-radius: 5px;
		box-shadow: 2px 2px 5px 0px #0002;
	}

	#context-menu .item
	{
		padding: 8px 10px;
		font-size: 15px;
		cursor: pointer;
	}

	#context-menu .item:hover
	{
		background: #f5f5f5;
		border-radius: inherit;
	}

	#table
	{
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	table
	{
		border-collapse: collapse;
		background: white;
		border-radius: 10px;
		overflow: hidden; /* fixes no border for some random fucking reason */
	}

	th, td
	{
		padding-left: 8px;
		text-align: left;
	}

	thead tr
	{
		height: 60px;
		background: #36304a;
	}

	thead th
	{
		font-size: 18px;
		color: white;
		line-height: 1.2;
		font-weight: unset;
	}

	tbody tr
	{
		height: 50px;
		font-size: 15px;
		color: #808080;
	}

	tbody tr:hover
	{
		color: #555555;
		background-color: #f5f5f5;
		cursor: pointer;
	}

	tbody tr:nth-child(even)
	{
		background-color: #f5f5f5;
	}

	.column1
	{
		width: 260px;
		padding-left: 40px;
	}

	.column2
	{
		width: 160px;
	}

	.column3
	{
		width: 245px;
	}

	.column4
	{
		width: 110px;
		text-align: right;
	}

	.column5
	{
		width: 170px;
		text-align: right;
	}

	.column6
	{
		width: 222px;
		text-align: right;
		padding-right: 62px;
	}

	input
	{
		width: 80%;

		background: #f5f5f5;
		border: none;
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
		outline: none;

		font-size: 15px;
		color: #808080;
	}

	input.error
	{
		border-bottom: 1px solid rgba(255, 0, 0, 1);
	}

	input.right
	{
		text-align: right;
	}

	.button1
	{
		transform: translate(30px, 15px);
	}

	.button1:active
	{
		transform: translate(30px, 17px);
	}

	.button2
	{
		transform: translate(60px, 15px);
	}

	.button2:active
	{
		transform: translate(60px, 17px);
	}

	button
	{
		position: absolute;
		right: 0%;

		width: 20px;
		height: 20px;

		background-color: transparent;
		border: none;

		text-align: center;
		cursor: pointer;
	}
</style>