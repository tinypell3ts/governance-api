module.exports = (res, e, code = 500) => {
  const error = {
    statusCode: code,
    message: e.message
  };

  return res.status(code).json({ error });
};
