const CategoryModel = require("../models/category");
const MovieModel = require("../models/movie");
const mongoose = require('mongoose');

async function getCategories()
{
	const categories = await CategoryModel.find({});
	return categories;
}

async function createCategory(name, promoted = false, movie_list = [])
{
	const category = new CategoryModel({
		name: name,
		promoted: promoted,
		movie_list: movie_list,
	});

	if (movie_list.length > 0)
	{
		// Adds the category id to the new movies
		await MovieModel.updateMany(
			{ _id: { $in: [...movie_list] } },
			{ $addToSet: { categories: category._id } }
		);
	}

	return await category.save();
}

async function getCategoryById(id)
{
	const category = await CategoryModel.findById(id);
	return category;
}

async function patchCategory(id, name, promoted, movie_list)
{
	const oldCategory = await CategoryModel.findById(id);
	if (!oldCategory) throw new Error("Category not found");

	const updateData = {};
	if (name !== undefined) updateData.name = name;
	if (promoted !== undefined) updateData.promoted = promoted;
	if (movie_list !== undefined)
	{
		updateData.movie_list = movie_list;

		const newMovieIds = new Set(updateData.movie_list.map(String) || []);
		const oldMovieIds = new Set(oldCategory.movie_list.map(String));

		// creates new arrays to add to and remove from the category id
		const moviesToAdd = [...newMovieIds].filter((id) => !oldMovieIds.has(id));
		const moviesToRemove = [...oldMovieIds].filter(
			(id) => !newMovieIds.has(id)
		);
		if (moviesToAdd.length > 0) {
            const moviesToAddObjectIds = moviesToAdd.map(id => new mongoose.Types.ObjectId(id));
            await MovieModel.updateMany(
                { _id: { $in: moviesToAddObjectIds } },
                { $addToSet: { categories: id } }
            );
        }

        if (moviesToRemove.length > 0) {
            const moviesToRemoveObjectIds = moviesToRemove.map(id => new mongoose.Types.ObjectId(id));
            await MovieModel.updateMany(
                { _id: { $in: moviesToRemoveObjectIds } },
                { $pull: { categories: id } }
            );
        }
	}

	const updatedCategory = await CategoryModel.findByIdAndUpdate(
		id,
		updateData,
		{
			new: true,
		}
	);
	return updatedCategory;
}

async function deleteCategory(id)
{
	const category = await CategoryModel.findById(id);
	if (!category) throw new Error("Category not found");

	const oldMovieIds = new Set(category.movie_list || []);

	// Remove the category id from the associated movies
	if (oldMovieIds.size > 0)
	{
		await MovieModel.updateMany(
			{ _id: { $in: [...oldMovieIds] } },
			{ $pull: { categories: category._id } }
		);
	}

	await CategoryModel.findByIdAndDelete(id);
	return category;
}

module.exports = {
	getCategories,
	getCategoryById,
	patchCategory,
	deleteCategory,
	createCategory,
};
