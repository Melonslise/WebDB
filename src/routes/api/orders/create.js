import * as database from "../_database";

const fields = [ "date", "name", "price", "quantity", "total" ];

export async function put(request)
{
	if(!request.locals.user)
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

	const added = await database.addOrderFor(request.locals.user.uname, request.body);

	return added ? { status: 200, body: { message: "Order added" } } : { status: 500, body: { message: "Error adding order to database" } };
}