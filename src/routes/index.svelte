<script>
	import { authorized, role } from "$lib/stores.js";

	import Entry from "$lib/Entry.svelte";
	import Logout from "$lib/Logout.svelte";
	import Table from "$lib/Table.svelte";
</script>

<script context="module">
	export function load({ session })
	{
		if(session.user)
		{
			authorized.set(true);
			role.set(session.user.role.id);
		}
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
	<Entry/>
{/if}