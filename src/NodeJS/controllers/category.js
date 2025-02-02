const categoriesService = require("../services/category");
const CategoryModel = require("../models/category");
const mongoose = require("mongoose");

const getCategories = async (req, res) =>
{
	const categories = await categoriesService.getCategories();
	res.status(200).json(categories);
};

const postCategory = async (req, res) =>
{
	const { name, promoted, movie_list } = req.body;
	if (!name || typeof name !== "string")
	{
		return res.status(400).json({ error: "Name is required" });
	}
	const sameName = await CategoryModel.findOne({ name });
	if (sameName)
	{
		return res
			.status(400)
			.json({ message: "Category with this name already exists" });
	}

	if (promoted !== undefined && typeof promoted !== "boolean")
	{
		return res.status(400).json({ error: "promoted' must be a boolean" });
	}
	if (
		movie_list &&
		(!Array.isArray(movie_list) ||
			movie_list.some((id) => !mongoose.Types.ObjectId.isValid(id)))
	)
	{
		return res
			.status(400)
			.json({ error: "'movie_list' contains invalid ObjectId" });
	}
	try
	{
		const category = await categoriesService.createCategory(
			name,
			promoted,
			movie_list
		);
		res.status(201).json(category);
	} catch (error)
	{
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const getCategoryById = async (req, res) =>
{
	const id = req.params.id;
	try
	{
		const category = await categoriesService.getCategoryById(id);
		if (!category)
		{
			return res.status(404).json({ error: "Category not found" });
		}
		res.status(200).json(category);
	} catch (error)
	{
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const patchCategory = async (req, res) =>
{
	const { id } = req.params;
	const { name, promoted, movie_list } = req.body;
	if (!mongoose.Types.ObjectId.isValid(id))
	{
		return res.status(400).json({ error: "Invalid category ID" });
	}
	if (name !== undefined && typeof name !== "string")
	{
		return res.status(400).json({ error: "'name' should be a string" });
	}
	const category = await CategoryModel.findById(id);
	if (!category)
	{
		return res.status(400).json({ message: "Category not found" });
	}

	const sameName = await CategoryModel.findOne({ name });
	if (sameName && sameName._id == category._id)
	{
		return res
			.status(400)
			.json({ message: "Category with this name already exists" });
	}

	if (promoted !== undefined && typeof promoted !== "boolean")
	{
		return res.status(400).json({ error: "'promoted' must be a boolean" });
	}

	try
	{
		const updatedCategory = await categoriesService.patchCategory(
			id,
			name,
			promoted,
			movie_list
		);

		if (!updatedCategory)
		{
			return res.status(404).json({ error: "Category not found" });
		}

		res.status(204).json(updatedCategory);
	} catch (error)
	{
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const deleteCategory = async (req, res) =>
{
	const id = req.params.id;
	try
	{
		const deletedCategory = await categoriesService.deleteCategory(id);
		if (!deletedCategory)
		{
			return res.status(404).json({ error: "Category not found" });
		}
		res.status(204).json();
	} catch (error)
	{
		res.status(500).json({ error: "Internal Server Error" });
	}
};

module.exports = {
	getCategories,
	getCategoryById,
	deleteCategory,
	patchCategory,
	postCategory,
};
