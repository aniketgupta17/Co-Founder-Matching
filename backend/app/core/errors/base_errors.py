class AppError(Exception):
    pass


class LLMError(AppError):
    pass


class VectorDBError(AppError):
    pass


class EmbedderError(AppError):
    pass
