from abc import ABC, abstractmethod
from typing import List


class Embedder(ABC):
    """
    Abstract Embedder class to be implemented.

    """

    @abstractmethod
    def embed(self, text: str, *args, **kwargs) -> List[float]:
        """
        Embed single text into vector.

        """
        pass
