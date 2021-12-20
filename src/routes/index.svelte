<script>
	import { authorized } from "$lib/stores.js";

	import Login from "$lib/Login.svelte";
	import Logout from "$lib/Logout.svelte";
	import Table from "$lib/Table.svelte";
</script>

<script context="module">
	export function load({ session })
	{
		authorized.set(Boolean(session.user));
		/*
		return {
			props:
			{
				user: session.user,
			}
		};
		*/
		return {};
	}
</script>

{#if $authorized}
	<Logout/>
	<Table/>
{:else}
	<Login/>
{/if}