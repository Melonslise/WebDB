import * as database from "../_database";

const fields = [ "date", "name", "price", "quantity", "total", "address", "receiverId", "statusId" ];

export async function put(request)
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

	request.body.senderId = request.locals.user.uid;

	const added = await database.addOrder(request.body);

	return added ? { status: 200, body: { message: "Order added" } } : { status: 500, body: { message: "Error adding order to database" } };
}