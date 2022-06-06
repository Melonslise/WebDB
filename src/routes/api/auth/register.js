import * as database from "../_database";

export async function post(request)
{
	if(!request.body.uname || !request.body.pwd)
	{
		return { status: 400, body: { message: "Data missing or invalid" } };
	}

	const user = await database.findUser(request.body.uname);

	if(user)
	{
		return { status: 409, body: { message: "Username taken" } };
	}

	await database.addUser(request.body.uname, request.body.pwd);

	return { status: 200, body: { message: "Registered" } };
}