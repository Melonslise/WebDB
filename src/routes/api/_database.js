import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const mysql = new Sequelize(
{
	dialect: "mysql",
	host: "remotemysql.com",
	port: 3306,
	username: process.env["MYSQL_UNAME"],
	password: process.env["MYSQL_PW"],
	database: process.env["MYSQL_DB"],
	logging: false
});

const Role = mysql.define("role",
{
	id:
	{
		type: DataTypes.STRING,
		primaryKey: true
	},
	readPerms:
	{
		type: DataTypes.BOOLEAN,
		allowNull: false
	},
	writePerms:
	{
		type: DataTypes.BOOLEAN,
		allowNull: false
	}
});

const User = mysql.define("user",
{
	username:
	{
		type: DataTypes.STRING,
		allowNull: false
	},
	password:
	{
		type: DataTypes.STRING,
		allowNull: false
	}
});

const Status = mysql.define("status",
{
	id:
	{
		type: DataTypes.STRING,
		primaryKey: true
	},
	cancellable:
	{
		type: DataTypes.BOOLEAN,
		allowNull: false
	}
});

const Order = mysql.define("order",
{
	date:
	{
		type: DataTypes.DATE,
		allowNull: false
	},
	name:
	{
		type: DataTypes.STRING,
		allowNull: false
	},
	price:
	{
		type: DataTypes.DECIMAL,
		allowNull: false
	},
	quantity:
	{
		type: DataTypes.INTEGER,
		allowNull: false
	},
	total:
	{
		type: DataTypes.DECIMAL,
		allowNull: false
	},
	address:
	{
		type: DataTypes.STRING,
		allowNull: false
	}
});

async function initDb()
{
	Role.hasMany(User, { foreignKey: { allowNull: false } });
	User.belongsTo(Role);

	Status.hasMany(Order, { foreignKey: { allowNull: false } });
	Order.belongsTo(Status);

	User.hasMany(Order, { foreignKey: { name: "senderId", allowNull: false } });
	Order.belongsTo(User, { as: "sender" });
	User.hasMany(Order, { foreignKey: { name: "receiverId", allowNull: false } });
	Order.belongsTo(User, { as: "receiver" });

	/*
	await Role.sync({ alter: true });
	await User.sync({ alter: true });
	await Status.sync({ alter: true });
	await Order.sync({ alter: true });
	*/

	//await Order.create({ date: Date.now(), name: "iPhone X 64Gb Grey", price: 999, quantity: 1, total: 999, address: "Stremyanny lane​, 36, Moscow, 117997, Russia", receiverId: 5, senderId: 2, statusId: "pending" });
}

initDb();

export function findUser(uname)
{
	return User.findOne({ where: { username: uname } });
}

export function findUserById(userId)
{
	return User.findByPk(userId);
}

export async function addUser(uname, pwd)
{
	await User.create({ username: uname, password: pwd, roleId: "user" });
}

export async function getRolePerms(role)
{
	return Role.findOne({ where: { id: role } });
}

export async function getOrderById(id)
{
	return Order.findByPk(id);
}

export async function getOrdersFor(uname)
{
	const user = await findUser(uname);

	if(!user)
	{
		return null;
	}

	return Order.findAll({ where: { receiverId: user.id } });
}

export async function getOrdersFrom(uname)
{
	const user = await findUser(uname);

	if(!user)
	{
		return null;
	}

	return Order.findAll({ where: { senderId: user.id } });
}

export async function addOrder(order)
{
	const receiver = await findUserById(order.receiverId);

	if(!receiver)
	{
		return false;
	}

	const sender = await findUserById(order.senderId);

	if(!sender)
	{
		return false;
	}

	const status = await Status.findByPk(order.statusId);

	if(!status)
	{
		return false;
	}

	await Order.create(order);

	return true;
}

export async function orderIsFor(uname, orderId)
{
	const user = await findUser(uname);

	if(!user)
	{
		return false;
	}

	const order = await getOrderById(orderId);

	return order && order.receiverId === user.id;
}

export async function orderSentBy(uname, orderId)
{
	const user = await findUser(uname);

	if(!user)
	{
		return false;
	}

	const order = await getOrderById(orderId);

	return order && order.senderId === user.id;
}

export async function deleteOrder(orderId)
{
	const order = await getOrderById(orderId);

	if(!order)
	{
		return false;
	}

	await order.destroy();

	return true;
}

export async function updateOrder(uorder)
{
	const order = await getOrderById(uorder.id);

	if(!order)
	{
		return false;
	}

	const receiver = await findUserById(uorder.receiverId);

	if(!receiver)
	{
		return false;
	}

	const sender = await findUserById(uorder.senderId);

	if(!sender)
	{
		return false;
	}

	const status = await Status.findByPk(uorder.statusId);

	if(!status)
	{
		return false;
	}

	order.set(uorder);
	await order.save();

	return true;
}

export async function cancelOrder(orderId)
{
	const order = await getOrderById(orderId);

	if(!order)
	{
		return false;
	}

	const status = await Status.findByPk(order.statusId);

	if(!status.cancellable)
	{
		return false;
	}

	order.statusId = "cancelled"; // TODO: move this to cancel.js?

	await order.save();

	return true;
}