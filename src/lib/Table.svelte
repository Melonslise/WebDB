<script>
	import { role } from "$lib/stores.js";

	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	onMount(updateOrders);

	function click(e)
	{
		const parent = e.target.parentNode;
		if(parent.nodeName !== "BUTTON" && parent.nodeName === "TR" && parent.parentNode.nodeName === "TBODY" && parent.id !== "new-row")
		{
			openMenu(e.clientX, e.clientY, parent.id.substring(5));

			return;
		}
		
		if(e.target.nodeName === "TH")
		{
			currentSorter = e.target.id.substring(5);
			updateDisplayOrders();
		}

		resetMenu();
	}

	/*
	*
	* Context Menu
	*
	*/

	let menuPos = { x: -1, y: -1 };

	let selectedOrderId;
	let orderBeingEdited;




	function openMenu(x, y, id)
	{
		menuPos.x = x;
		menuPos.y = y;

		selectedOrderId = id;
	}

	function resetMenu()
	{
		menuPos.x = -1;
		menuPos.y = -1;

		selectedOrderId = null;
	}

	function clickEdit()
	{
		orderBeingEdited = getSelectedOrder();

		for(const field in editErrors)
		{
			editErrors[field] = false;
		}

		if(!orderBeingEdited)
		{
			return;
		}

		resetMenu();
	}

	function stopEditingOrder()
	{
		orderBeingEdited = null;
	}

	async function clickDelete()
	{
		await deleteOrder(selectedOrderId);

		resetMenu();
	}

	async function clickCancel()
	{
		await cancelOrder(selectedOrderId);

		resetMenu();
	}

	/*
	*
	* CRUD stuff
	*
	*/

	const statuses = [ "pending", "shipped", "delivered", "cancelled" ]; // TODO: send from server

	const isCancellable = status => status === "pending" || status === "shipped"; // TODO: this too

	let orders = [];

	const addErrors = {
		name: false,
		price: false,
		quantity: false,
		total: false,
		address: false,
		receiverId: false
	};

	const editErrors = Object.assign({}, addErrors);





	async function updateOrders()
	{
		const response = await fetch("/api/orders/read");

		if(!response.ok)
		{
			return;
		}

		const body = await response.json();

		orders = body.orders;
		updateDisplayOrders();
	}

	async function addOrder(e)
	{
		const data = parseForm(e);

		if(!validateForm(data, addErrors))
		{
			addErrors = addErrors;
			return;
		}

		if(!data.date)
		{
			data.date = Date.now();
		}

		const response = await fetch("/api/orders/create",
		{
			method: "PUT",
			body: JSON.stringify(data),
			headers: { "Content-Type": "application/json" }
		});

		if(response.ok)
		{
			document.getElementById("add-form").reset();
			updateOrders();
		}
		else
		{
			addErrors.receiverId = true;
		}
	}

	async function editOrder(e)
	{
		const data = parseForm(e);

		if(!validateForm(data, editErrors))
		{
			editErrors = editErrors;
			return;
		}

		data.id = orderBeingEdited.id;

		if(!data.date)
		{
			data.date = Date.now();
		}

		const response = await fetch("/api/orders/update",
		{
			method: "POST",
			body: JSON.stringify(data),
			headers: { "Content-Type": "application/json" }
		});

		if(response.ok)
		{
			stopEditingOrder(); // TODO: do not allow to send this again while waiting for response from server
			updateOrders();
		}
		else
		{
			editErrors.receiverId = true;
		}
	}

	async function deleteOrder(id)
	{
		const response = await fetch("/api/orders/delete",
		{
			method: "DELETE",
			body: JSON.stringify({ id: id }),
			headers: { "Content-Type": "application/json" }
		});

		if(response.ok)
		{
			updateOrders();
		}
	}

	async function cancelOrder(id)
	{
		const response = await fetch("/api/orders/cancel",
		{
			method: "POST",
			body: JSON.stringify({ id: id }),
			headers: { "Content-Type": "application/json" }
		});

		if(response.ok)
		{
			updateOrders();
		}
	}

	/*
	*
	* Sorting / Filtering
	*
	*/

	// TODO: close menu on order refresh and stop editing

	let displayOrders = [];

	const orderFields = {
		"date": "Date",
		"id": "ID",
		"name": "Name",
		"price": "Price",
		"quantity": "Quantity",
		"total": "Total",
		"address": "Address",
		"receiver": "To",
		"sender": "From",
		"statusId": "Status"
	};

	let currentSorter = null;

	if(!isAdmin())
	{
		delete orderFields["receiver"];
	}





	function updateDisplayOrders()
	{
		displayOrders = orders.slice(); // shallow copy

		applyFilter();
		applySorter();
	}

	function applyFilter()
	{
		const type = document.getElementById("filter-type").value;
		const str = document.getElementById("filter-search").value;

		if(str.trim().length <= 0)
		{
			return;
		}

		displayOrders = displayOrders.filter(e => String(e[type]).includes(str));
	}

	function applySorter()
	{
		displayOrders.sort((a, b) =>
		{
			if(a[currentSorter] < b[currentSorter])
			{
				return -1;
			}
			if(a[currentSorter] > b[currentSorter])
			{
				return 1; 
			}
			return 0;
		});

		displayOrders = displayOrders;
	}

	/*
	*
	* Utils
	*
	*/

	function getSelectedOrder()
	{
		return orders.find(o => o.id == selectedOrderId);
	}

	function isAdmin()
	{
		return $role === "admin";
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
	}
</script>

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
		<symbol id = "arrow" viewBox = "0 0 490 490">
			<g fill = "#ffffff">
				<polygon points = "490, 157.332 244.996, 407.369 0, 157.332 76.493, 82.631 244.996, 254.598 413.507, 82.631"/>
			</g>
		</symbol>
	</defs>
</svg>

{#if menuPos.x >= 0 && menuPos.y >= 0}
<div id = "context-menu" in:fade = {{ duration: 80 }} style = "left: {menuPos.x}px; top: {menuPos.y}px">
	{#if isAdmin()}
	<div class = "item" on:click = {clickEdit}>Edit</div>
	<div class = "item" on:click = {clickDelete}>Delete</div>
	{:else}
	{#if isCancellable(getSelectedOrder().statusId)}
	<div class = "item" on:click = {clickCancel}>Cancel</div>
	{/if}
	{/if}
</div>
{/if}

<div id = "screen" on:click = {click}>
	<div id = "main">
		<div id = "filter">
		<input id = "filter-search" on:input = {updateDisplayOrders} style = "width: 60%">
		<select id = "filter-type" on:change = {updateDisplayOrders} style = "width: 35%">
			{#each Object.keys(orderFields) as type}
			<option value = {type}>{orderFields[type]}</option>
			{/each}
		</select>
		</div>
		<form id = "add-form" on:submit|preventDefault = {addOrder}></form>
		<form id = "edit-form" on:submit|preventDefault = {editOrder}></form>
		<table>
			<thead>
				<tr>
					{#each Object.keys(orderFields) as field}
					<th id = {"head_" + field}>
					{orderFields[field]}
					{#if field === currentSorter}
					<svg width = "10px" height = "10px">
						<use href = "#arrow">
					</svg>
					{/if}
					</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each displayOrders as order}
				<tr id = {"order" + order.id}>
					{#if order !== orderBeingEdited}
					<td>{new Date(order.date).toLocaleString("ru-ru")}</td>
					<td>{order.id}</td>
					<td>{order.name}</td>
					<td>${order.price}</td>
					<td>{order.quantity}</td>
					<td>${order.total}</td>
					<td>{order.address}</td>
					{#if isAdmin()}
					<td>{order.receiver}</td>
					{/if}
					<td>{order.sender}</td>
					<td>{order.statusId}</td>
					{:else}
					<td><input name = "date" type = "datetime-local" value = {(toInputDate(order.date))} form = "edit-form" step = "1"></td>
					<td>{order.id}</td>
					<td><input class:error = {editErrors.name}			name = "name"		value = {order.name} form = "edit-form"></td>
					<td><input class:error = {editErrors.price}			name = "price"		value = {order.price} type = "number" form = "edit-form"></td>
					<td><input class:error = {editErrors.quantity}		name = "quantity"	value = {order.quantity} type = "number" form = "edit-form"></td>
					<td><input class:error = {editErrors.total}			name = "total"		value = {order.total} type = "number" form = "edit-form"></td>
					<td><input class:error = {editErrors.address}		name = "address"	value = {order.address} form = "edit-form"></td>
					<td><input class:error = {editErrors.receiverId}	name = "receiverId"	value = {order.receiverId} type = "number" form = "edit-form"></td>
					<td>{order.senderId}</td>
					<td>
						<select name = "statusId" form = "edit-form">
							{#each statuses as status}
							<option value = {status} selected = {order.statusId === status}>{status}</option>
							{/each}
						</select>
					</td>
					<button class = "button1" type = "submit" form = "edit-form">
						<svg width = "20px" height = "20px">
							<use href = "#check">
						</svg>
					</button>
					<button class = "button2" on:click = {stopEditingOrder}>
						<svg width = "20px" height = "20px">
							<use href = "#cross">
						</svg>
					</button>
					{/if}
				</tr>
				{/each}
				{#if isAdmin()}
				<tr id = "new-row">
					<td><input name = "date" type = "datetime-local" form = "add-form" step = "1"></td>
					<td></td>
					<td><input class:error = {addErrors.name}		name = "name"		form = "add-form"></td>
					<td><input class:error = {addErrors.price}		name = "price"		type = "number" form = "add-form"></td>
					<td><input class:error = {addErrors.quantity}	name = "quantity"	type = "number" form = "add-form"></td>
					<td><input class:error = {addErrors.total}		name = "total"		type = "number" form = "add-form"></td>
					<td><input class:error = {addErrors.address}	name = "address"	form = "add-form"></td>
					<td><input class:error = {addErrors.receiverId}	name = "receiverId"	type = "number" form = "add-form"></td>
					<td></td>
					<td>
						<select name = "statusId" form = "add-form">
							{#each statuses as status}
							<option value = {status}>{status}</option>
							{/each}
						</select>
					</td>
					<button class = "button1" type = "submit" form = "add-form">
						<svg width = "20px" height = "20px">
							<use href = "#plus">
						</svg>
					</button>
				</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	#filter
	{
		width: 256px;
		height: 38px;
		
		margin: 10px 0px;
		padding: 8px;
	
		border: none;
		border-radius: 8px;
		background-color: white;
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

	#screen
	{
		width: 100%;
		height: 100%;
	}

	#main
	{
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	table
	{
		border-collapse: collapse;
		border-radius: 10px;
		overflow: hidden; /* fixes no border for some random fucking reason */
	}

	thead tr
	{
		height: 60px;
		background: #36304a;
	}

	thead th
	{
		min-width: 130px;
		font-size: 18px;
		color: white;
		line-height: 1.2;
		font-weight: unset;
		padding: 20px;
		cursor: pointer;
	}

	tbody tr
	{
		height: 50px;
		font-size: 15px;
		text-align: center;
		color: #808080;
		background: white;
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

	input, select
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
</style>