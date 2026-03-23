const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error.issues) {
      // Map Zod errors
      const errors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ success: false, errors, message: "Validation error" });
    }
    return res.status(400).json({ success: false, message: "Invalid input" });
  }
};

module.exports = { validateRequest };
