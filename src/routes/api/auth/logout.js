import * as sessions from "./_session_manager";
import * as cookie from "cookie";

export async function post(request)
{
	if(!request.locals.user)
	{
		return { status: 401, body: { message: "Not authorized" } };
	}

	const uname = request.locals.user.uname;

	sessions.deleteSessionByUname(uname);
	return { // FIXME chrome doesn't delete cookie
		status: 200,
		body: { message: "logged out" },
		"Set-Cookie": cookie.serialize("session_id", "",
		{
			expires: new Date(0),
			path: "/"
		})
	};
}