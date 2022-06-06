import * as database from "../_database";

const fields = [ "date", "id", "name", "price", "quantity", "total", "address", "receiverId", "statusId" ];

export async function post(request)
{
	if(!request.locals.user || !request.locals.user.role.writePerms)
	{
		return { status: 401, body: { message: "Not authorized" } };
	}

	for(field of fields)
	{
		if(!request.body[field])
		{
			return { status: 400, body: { message: "Data missing or invalid" } };
		}
	}

	const uname = request.locals.user.uname;
	const order = request.body;

	if(!database.orderSentBy(uname, order.id))
	{
		return { status: 403, body: { message: "Forbidden" } };
	}

	request.body.senderId = request.locals.user.uid;

	const updated = await database.updateOrder(order);

	return updated ? { status: 200, body: { message: "Order updated" } } : { status: 500, body: { message: "Error updating order in database" } };
}