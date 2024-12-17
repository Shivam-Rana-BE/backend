import Joi from 'joi';

const addTherapistCategoryValidator = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Category name is required',
    'string.min': 'Category name should have at least 3 characters',
    'string.max': 'Category name should have at most 100 characters',
  }),
});

const updateTherapistCategoryValidator = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Category name is required',
    'string.min': 'Category name should have at least 3 characters',
    'string.max': 'Category name should have at most 100 characters',
  })

});

export { addTherapistCategoryValidator, updateTherapistCategoryValidator };
