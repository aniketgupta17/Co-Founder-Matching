from core.errors import VectorDBError


class PCVectorDBError(VectorDBError):
    pass


class PCVectorDBClientError(PCVectorDBError):
    pass


class PCVectorDBIndexError(PCVectorDBError):
    pass


class PCVectorDBOperationError(PCVectorDBError):
    pass
