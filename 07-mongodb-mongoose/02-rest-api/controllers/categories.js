const Category = require('./../models/Category');

function mapSubcategory({_id, title}) {
    return {id: _id, title}
}

function mapCategory({_id, title, subcategories}) {
    return {id: _id, title, subcategories: subcategories.map(mapSubcategory)}
}

module.exports.categoryList = async function categoryList(ctx) {
    const categories = await Category.find().populate('subcategories');
    ctx.body = {categories: categories.map(mapCategory)};
};
