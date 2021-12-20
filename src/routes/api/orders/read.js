import * as database from "../_database";

export async function get(request)
{
	if(!request.locals.user)
	{
		return { status: 401, body: { message: "Not authorized" } };
	}

	const orders = await database.getOrdersFor(request.locals.user.uname);

	const response = JSON.stringify({ orders: orders });

	return { status: 200, body: response };
}