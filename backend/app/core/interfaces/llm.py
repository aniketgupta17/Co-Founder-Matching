from abc import ABC, abstractmethod
from typing import Any, List, TypeVar, Type
from pydantic import BaseModel

ResponseModelType = TypeVar("ResponseModelType", bound=BaseModel)


class LLM(ABC):
    """
    Abstract LLM class to be implmemented

    """

    @abstractmethod
    def call(self, messages: List[Any], *args, **kwargs) -> str:
        """
        LLM call without response streaming
        """
        pass

    @abstractmethod
    def stream_call(self, messages: List[Any], *args, **kwargs) -> Any:
        """
        LLM call with response streaming
        """

    @abstractmethod
    def structured_call(
        self, messages: List[Any], response_model: Type[ResponseModelType]
    ) -> ResponseModelType:
        """
        LLM call with a structured response
        """
        pass
