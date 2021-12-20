import * as database from "../_database";

export async function del(request)
{
	if(!request.locals.user)
	{
		return { status: 401, body: { message: "Not authorized" } };
	}

	const uname = request.locals.user.uname;
	const orderId = request.body.id;

	if(!orderId)
	{
		return { status: 400, body: { message: "Data missing or invalid" } };
	}

	if(!database.orderBelongsTo(uname, orderId))
	{
		return { status: 403, body: { message: "Forbidden" } };
	}

	const deleted = await database.deleteOrder(orderId);

	return deleted ? { status: 200, body: { message: "Order deleted" } } : { status: 500, body: { message: "Error deleting order from database" } };
}