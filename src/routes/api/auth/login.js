import * as database from "../_database";
import * as sessions from "./_session_manager";
import * as cookie from "cookie";

export async function post(request)
{
	if(!request.body.uname || !request.body.pwd)
	{
		return { status: 400, body: { message: "Data missing or invalid" } };
	}

	const user = await database.findUserAccount(request.body.uname, request.body.pwd);

	if(!user)
	{
		return { status: 401, body: { message: "Username or password not found" } };
	}

	const sessionId = sessions.createSession(user.username);

	return {
		status: 200,
		body: { message: "Logged in" },
		headers:
		{
			"Set-Cookie": cookie.serialize("session_id", sessionId,
			{
				httpOnly: true,
				sameSite: "strict",
				maxAge: 60 * 60 * 24 * 7,
				path: "/"
			})
		}
	};
}