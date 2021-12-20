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
	}
});

async function initDb()
{
	User.hasMany(Order, { foreignKey: { allowNull: false } });
	Order.belongsTo(User);
	await User.sync({ alter: true });
	await Order.sync({ alter: true });
	// await Order.create({ date: Date.now(), name: "iPhone X 64Gb Grey", price: 999, quantity: 1, total: 999, userId: 1 });
}

initDb();

export function findUserAccount(uname, pwd)
{
	return User.findOne({ where: { username: uname, password: pwd } });
}

export function findUser(uname)
{
	return User.findOne({ where: { username: uname } });
}

export async function getOrdersFor(uname)
{
	const user = await findUser(uname);

	if(!user)
	{
		return null;
	}

	return Order.findAll({ where: { userId: user.id } });
}

export async function addOrderFor(uname, order)
{
	const user = await findUser(uname);

	if(!user)
	{
		return false;
	}

	order.userId = user.id;
	await Order.create(order);

	return true;
}

export async function orderBelongsTo(uname, orderId)
{
	const user = await findUser(uname);

	if(!user)
	{
		return false;
	}

	const order = await Order.findByPk(orderId);

	return order && order.id === orderId;
}

export async function deleteOrder(orderId)
{
	const order = await Order.findByPk(orderId);

	if(!order)
	{
		return false;
	}

	await order.destroy();

	return true;
}

export async function updateOrder(uorder)
{
	const order = await Order.findByPk(uorder.id);

	if(!order)
	{
		return false;
	}

	order.set(uorder);
	await order.save();

	return true;
}