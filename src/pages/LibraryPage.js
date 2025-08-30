import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../utils/hooks';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';

const LibraryPage = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
  }, []);

  // Carregar materiais da biblioteca
  useEffect(() => {
    if (!user) return;
    const loadMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from('library')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });
        if (error) throw error;
        setMaterials(data || []);
      } catch (err) {
        console.error('Erro ao carregar materiais:', err);
      }
    };
    loadMaterials();
  }, [user]);

  // Função para lidar com o upload de arquivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  // Função para extrair texto do arquivo
  const extractTextFromFile = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Verificar a extensão do arquivo
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (fileExtension === 'txt') {
        // Para arquivos de texto, ler diretamente
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileContent(e.target.result);
          setLoading(false);
        };
        reader.readAsText(file);
      } else if (fileExtension === 'pdf') {
        // Para PDF, usar pdf.js
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let content = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            content += textContent.items.map(item => item.str).join(' ');
          }

          setFileContent(content);
          setLoading(false);
        };
        fileReader.readAsArrayBuffer(file);
      } else if (fileExtension === 'docx') {
        // Para DOCX, usar mammoth.js
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          setFileContent(result.value);
          setLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        setError('Formato de arquivo não suportado. Use .txt, .pdf ou .docx');
        setLoading(false);
      }
    } catch (err) {
      setError('Erro ao extrair texto do arquivo: ' + err.message);
      setLoading(false);
    }
  };

  // Função para adicionar material à biblioteca
  const handleAddMaterial = async () => {
    if (!fileName || !fileContent || !user) {
      setError('Por favor, selecione um arquivo e extraia seu conteúdo primeiro');
      return;
    }

    try {
      const { error } = await supabase.from('library').insert([
        {
          user_id: user.id,
          nome_arquivo: fileName,
          texto_extraído: fileContent,
          criado_em: new Date().toISOString()
        }
      ]);
      if (error) throw error;
      // Atualizar a lista de materiais
      const { data, error: fetchError } = await supabase
        .from('library')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false });
      if (fetchError) throw fetchError;
      setMaterials(data || []);
      // Limpar os campos
      setFile(null);
      setFileName('');
      setFileContent('');
      setError('');
    } catch (err) {
      setError('Erro ao adicionar material: ' + err.message);
    }
  };

  // Função para remover material da biblioteca
  const handleRemoveMaterial = async (id) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('library').delete().eq('id', id);
      if (error) throw error;
      // Atualizar a lista de materiais
      const { data, error: fetchError } = await supabase
        .from('library')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false });
      if (fetchError) throw fetchError;
      setMaterials(data || []);
    } catch (err) {
      setError('Erro ao remover material: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Biblioteca de Materiais</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Adicionar Novo Material</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecionar Arquivo (.txt, .pdf, .docx)
            </label>
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
          
          {file && (
            <div>
              <button
                onClick={extractTextFromFile}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Extraindo...' : 'Extrair Texto'}
              </button>
              {loading && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
          )}
          
          {fileContent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Arquivo
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              />
              <button
                onClick={handleAddMaterial}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Adicionar à Biblioteca
              </button>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Materiais na Biblioteca</h2>
        {materials.length === 0 ? (
          <p className="text-gray-500">Nenhum material adicionado ainda.</p>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => (
              <div key={material.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{material.name}</h3>
                  <p className="text-sm text-gray-500">
                    Adicionado em: {material.createdAt?.toDate().toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMaterial(material.id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;