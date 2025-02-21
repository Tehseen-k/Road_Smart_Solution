class ResponseHandler {
  constructor(res) {
    this.res = res;
  }

  success(data, message = 'Success', statusCode = 200) {
    return this.res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  }

  error(message, statusCode = 400) {
    return this.res.status(statusCode).json({
      status: 'error',
      message
    });
  }

  created(data, message = 'Created successfully') {
    return this.success(data, message, 201);
  }

  noContent() {
    return this.res.status(204).send();
  }

  notFound(message = 'Resource not found') {
    return this.error(message, 404);
  }
}

module.exports = ResponseHandler; 