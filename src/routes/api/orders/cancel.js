import * as database from "../_database";

export async function post(request)
{
	if(!request.locals.user || !request.locals.user.role.readPerms)
	{
		return { status: 401, body: { message: "Not authorized" } };
	}

	const uname = request.locals.user.uname;
	const orderId = request.body.id;

	if(!orderId)
	{
		return { status: 400, body: { message: "Data missing or invalid" } };
	}

	if(!database.orderIsFor(uname, orderId))
	{
		return { status: 403, body: { message: "Forbidden" } };
	}

	const cancelled = await database.cancelOrder(orderId);

	return cancelled ? { status: 200, body: { message: "Order cancelled" } } : { status: 500, body: { message: "Error cancelling order" } };
}