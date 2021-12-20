import * as sessions from "./routes/api/auth/_session_manager";
import * as cookie from "cookie";

export function handle({ request, resolve })
{
	const cookies = cookie.parse(request.headers.cookie || "");

	if(cookies.session_id)
	{
		const session = sessions.getSessionById(cookies.session_id);
		if(session)
		{
			request.locals.user = { uname: session.uname };
			return resolve(request);
		}
	}

	request.locals.user = null;
	return resolve(request);
}

export function getSession(request)
{
	return request.locals.user ? { user: { uname: request.locals.user.uname } } : {};
}