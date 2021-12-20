import * as uuid from "uuid";

const sessionById = new Map();
const sessionByUname = new Map();

export function createSession(uname)
{
	deleteSessionByUname(uname);

	const session = { id: uuid.v4(), uname: uname };

	sessionById.set(session.id, session);
	sessionByUname.set(session.uname, session);

	return session.id;
}

export function getSessionById(id)
{
	return sessionById.get(id);
}

export function deleteSessionByUname(uname)
{
	const session = sessionByUname.get(uname);

	if(session)
	{
		sessionById.delete(session.id);
		sessionByUname.delete(session.uname);
	}
}