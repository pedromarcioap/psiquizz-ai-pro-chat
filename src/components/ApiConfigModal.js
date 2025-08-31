import React, { useState, useEffect } from 'react';

const ApiConfigModal = ({
  show,
  onClose,
  selectedApiProvider,
  setSelectedApiProvider,
  openRouterConfig,
  setOpenRouterConfig,
  huggingFaceConfig,
  setHuggingFaceConfig,
}) => {
  const [currentProvider, setCurrentProvider] = useState(selectedApiProvider);
  const [currentOpenRouterConfig, setCurrentOpenRouterConfig] = useState(openRouterConfig);
  const [currentHuggingFaceConfig, setCurrentHuggingFaceConfig] = useState(huggingFaceConfig);

  useEffect(() => {
    setCurrentProvider(selectedApiProvider);
    setCurrentOpenRouterConfig(openRouterConfig);
    setCurrentHuggingFaceConfig(huggingFaceConfig);
  }, [selectedApiProvider, openRouterConfig, huggingFaceConfig]);

  const handleSave = () => {
    setSelectedApiProvider(currentProvider);
    setOpenRouterConfig(currentOpenRouterConfig);
    setHuggingFaceConfig(currentHuggingFaceConfig);
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Configurar APIs de IA</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Provedor de API:</label>
          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="apiProvider"
                value="gemini"
                checked={currentProvider === 'gemini'}
                onChange={() => setCurrentProvider('gemini')}
              />
              <span className="ml-2">Gemini (Padrão)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="apiProvider"
                value="openrouter"
                checked={currentProvider === 'openrouter'}
                onChange={() => setCurrentProvider('openrouter')}
              />
              <span className="ml-2">OpenRouter</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="apiProvider"
                value="huggingface"
                checked={currentProvider === 'huggingface'}
                onChange={() => setCurrentProvider('huggingface')}
              />
              <span className="ml-2">Hugging Face</span>
            </label>
          </div>
        </div>

        {currentProvider === 'openrouter' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="openrouter-api-key">
              OpenRouter API Key:
            </label>
            <input
              type="text"
              id="openrouter-api-key"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={currentOpenRouterConfig.apiKey}
              onChange={(e) => setCurrentOpenRouterConfig({ ...currentOpenRouterConfig, apiKey: e.target.value })}
            />
            <label className="block text-gray-700 text-sm font-bold mb-2 mt-2" htmlFor="openrouter-model">
              OpenRouter Model (e.g., "mistralai/mistral-7b-instruct"):
            </label>
            <input
              type="text"
              id="openrouter-model"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={currentOpenRouterConfig.model}
              onChange={(e) => setCurrentOpenRouterConfig({ ...currentOpenRouterConfig, model: e.target.value })}
            />
          </div>
        )}

        {currentProvider === 'huggingface' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="huggingface-api-key">
              Hugging Face API Key:
            </label>
            <input
              type="text"
              id="huggingface-api-key"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={currentHuggingFaceConfig.apiKey}
              onChange={(e) => setCurrentHuggingFaceConfig({ ...currentHuggingFaceConfig, apiKey: e.target.value })}
            />
            <label className="block text-gray-700 text-sm font-bold mb-2 mt-2" htmlFor="huggingface-model">
              Hugging Face Model (e.g., "gpt2"):
            </label>
            <input
              type="text"
              id="huggingface-model"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={currentHuggingFaceConfig.model}
              onChange={(e) => setCurrentHuggingFaceConfig({ ...currentHuggingFaceConfig, model: e.target.value })}
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal;