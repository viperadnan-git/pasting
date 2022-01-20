const Joi = require('joi');
const websiteName = process.env.WEBSITE_NAME


const schemas = {
    Paste: Joi.object().keys({
        content: Joi.string().required(),
        key: Joi.string().empty(['', false, null]).alphanum().max(16),
        heading: Joi.string().default(websiteName),
        code: Joi.bool().default(false),
        raw: Joi.bool().default(true),
    })
};


module.exports = schemas;