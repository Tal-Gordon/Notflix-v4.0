const userService = require("../services/user");

const isValidArrayOfNumbers = (arr) =>
{
	if (!Array.isArray(arr))
	{
		return false; // Not an array
	}
	return arr.every((item) => typeof item === "number" && !isNaN(item)); // Ensure every item is a valid number
};

const createUser = async (req, res) =>
{
	const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).{8,}$/;
	try
	{
		if (!req.body.username)
		{
			return res.status(400).json({ error: "Username cannot be empty" });
		} else if (
			!req.body.password ||
			typeof req.body.password != "string" ||
			req.body.password.length < 8 ||
			!regex.test(req.body.password)
		)
		{
			return res.status(400).json({
				error:
					"Password must be a string with at least 8 characters and contain contain lowercase, uppercase, number, and special character",
			});
		}
		if (
			req.body.watchedMovies &&
			!isValidArrayOfNumbers(req.body.watchedMovies)
		)
		{
			return res
				.status(400)
				.json({ error: "watchedMovies must be an array of numbers" });
		}
		if (
			req.body.watchedMovies &&
			new Set(req.body.watchedMovies).size !== req.body.watchedMovies.length
		)
		{
			return res
				.status(400)
				.json({ error: "Duplicate movies are not allowed" });
		}

		const result = await userService.createUser(
			req.body.username,
			req.body.password,
			req.body.name,
			req.body.surname,
			req.file,
			req.body.watchedMovies
		);

		if (result.errors.length > 0)
		{
			res.status(400).json({
				data: result.user,
				errors: result.errors,
			});
		} else
		{
			res.status(201).json({
				data: result.user,
			});
		}
	} catch (error)
	{
		return res.status(500).json({ error: "Internal server error" });
	}
};

const getUser = async (req, res) =>
{
	try
	{
		const user = await userService.getUserById(req.params.id);
		if (!user)
		{
			return res.status(404).json({ error: "User not found" });
		}

		res.json(user);
	} catch (error)
	{
		return res.status(500).json({ error: "Internal server error" });
	}
};

const isUserRegistered = async (req, res) =>
{
	try
	{
		const { username, password } = req.body;
		if (!username || !password)
		{
			return res
				.status(400)
				.json({ error: "Username and password are required" });
		}
		const user = await userService.getUserByCredentials(username, password);

		if (!user)
		{
			return res
				.status(404)
				.json({ error: "User not found or incorrect credentials" });
		}

		return res.status(200).json({ id: user._id });
	} catch (error)
	{
		return res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	createUser,
	getUser,
	isUserRegistered,
};
