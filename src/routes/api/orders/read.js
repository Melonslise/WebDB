import * as database from "../_database";

export async function get(request)
{
	if(!request.locals.user || !request.locals.user.role.readPerms)
	{
		return { status: 401, body: { message: "Not authorized" } };
	}

	const user = await database.findUser(request.locals.user.uname);
	const role = user.roleId;

	const orders = await database.getOrdersFor(request.locals.user.uname);
	await appendNames(orders, false, true);

	if(role === "admin")
	{
		const sentOrders = await database.getOrdersFrom(request.locals.user.uname);
		await appendNames(sentOrders, true, true);
		orders.push(...sentOrders);
		
	}

	const response = JSON.stringify({ orders: orders });

	return { status: 200, body: response };
}

async function appendNames(orders, doReceiver, doSender)
{
	if(!doReceiver && !doSender)
	{
		return;
	}

	for(const order of orders)
	{
		if(doReceiver)
		{
			const receiver = await database.findUserById(order.receiverId);
			order.setDataValue("receiver", receiver.username);
		}

		if(doSender)
		{
			const sender = await database.findUserById(order.senderId);
			order.setDataValue("sender", sender.username);
		}
	}
}