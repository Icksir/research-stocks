from llama_index.llms.google_genai import GoogleGenAI
import tiktoken
from settings.env_config import env_settings
from llama_index.core import Settings
from google.oauth2 import service_account
from llama_index.embeddings.vertex import VertexTextEmbedding
from llama_index.core.callbacks import CallbackManager, TokenCountingHandler

credentials: service_account.Credentials = (
    service_account.Credentials.from_service_account_file(env_settings.google_application_credentials)
)

Settings.llm = GoogleGenAI(
            model="gemini-2.5-flash",
            api_key=env_settings.google_api_key,
            max_tokens=8192,
            temperature=0.3,
        )

Settings.embed_model = VertexTextEmbedding(
                            model_name="text-multilingual-embedding-002",
                            credentials=credentials,
                            embed_batch_size=1
                        )

token_counter = TokenCountingHandler(
    tokenizer=tiktoken.encoding_for_model("gpt-4o").encode
)

callback_manager = CallbackManager([token_counter])

Settings.chunk_size = 512

Settings.callback_manager = callback_manager
