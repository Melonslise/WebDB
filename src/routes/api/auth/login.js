import * as database from "../_database";
import * as sessions from "./_session_manager";
import * as cookie from "cookie";

export async function post(request)
{
	if(!request.body.uname || !request.body.pwd)
	{
		return { status: 400, body: { message: "Data missing or invalid" } };
	}

	const user = await database.findUser(request.body.uname);

	if(!user || user.password !== request.body.pwd)
	{
		return { status: 401, body: { message: "Username or password not found" } };
	}

	const role = await database.getRolePerms(user.roleId);

	if(!role)
	{
		return { status: 500, body: { message: "Role not found" } };
	}

	const session = sessions.createSession(user.username);

	session.role = { id: role.id, readPerms: role.readPerms, writePerms: role.writePerms };
	session.uid = user.id;

	return {
		status: 200,
		body: { message: "Logged in", userId: user.id, role: user.roleId },
		headers:
		{
			"Set-Cookie": cookie.serialize("session_id", session.id,
			{
				httpOnly: true,
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 7,
				path: "/"
			})
		}
	};
}