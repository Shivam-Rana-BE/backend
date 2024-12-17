import { response400 } from "../../lib/response-messages/index.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return response400(res, error?.details?.[0]?.message);
    }
    next();
  };
};

export const validateFormData = (schema, fileFields = []) => (req, res, next) => {

  const contentType = req.headers['content-type'] || '';

  // Check if the request's content type is multipart/form-data
  if (!contentType.startsWith('multipart/form-data')) {
    return response400(res, 'Invalid request type. Content-Type must be multipart/form-data.');
  }

  for (const field of fileFields) {
    if (!req.files?.[field] && !req.file) {
      return response400(res, `${field} is required.`);
    }
  }
  // Extract the non-file data from req.body
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return response400(res, error?.details?.[0]?.message);
  }

  req.body = value;
  next();
};



import * as userValidator from "./user.validation.js";
import * as parentValidator from "./parent.validation.js";
import * as therapistValidator from "./therapist.validation.js";
import * as therapistCenterValidator from "./therapist_center.validation.js";
import * as commonValidator from "./common.validation.js";
import * as kidValidator from "./kid.validation.js";
import * as adminValidator from "./admin.validation.js";
import * as therapistCategoryValidator from "./therapist_category.validation.js";
import * as chatValidator from "./chat.validation.js";

export { userValidator, parentValidator, therapistValidator, therapistCenterValidator, commonValidator, kidValidator, adminValidator, therapistCategoryValidator, chatValidator };