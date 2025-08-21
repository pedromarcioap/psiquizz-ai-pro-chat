import React, { useState } from 'react';

const ChatHistorySidebar = ({ chats, onSelectChat, onNewChat, onRenameChat, onDeleteChat, activeChatId }) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [newName, setNewName] = useState('');

  const handleRename = (chat) => {
    setEditingChatId(chat.id);
    setNewName(chat.name);
  };

  const handleSaveRename = (chatId) => {
    if (newName.trim()) {
      onRenameChat(chatId, newName.trim());
    }
    setEditingChatId(null);
    setNewName('');
  };

  const handleDelete = (chatId) => {
    if (window.confirm('Tem certeza que deseja excluir este chat?')) {
      onDeleteChat(chatId);
    }
  };

  return (
    <div className="w-64 bg-gray-50 p-4 border-r border-gray-200 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Histórico de Chats</h2>
      <button
        onClick={onNewChat}
        className="w-full mb-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Novo Chat
      </button>
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer ${activeChatId === chat.id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
            onClick={() => onSelectChat(chat.id)}
          >
            {editingChatId === chat.id ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleSaveRename(chat.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(chat.id)}
                className="text-sm font-medium text-gray-800 bg-transparent border-b border-indigo-500"
                autoFocus
              />
            ) : (
              <p className="text-sm font-medium text-gray-800 truncate">{chat.name}</p>
            )}
            <div className="opacity-0 group-hover:opacity-100 flex items-center">
              <button onClick={(e) => { e.stopPropagation(); handleRename(chat); }} className="text-gray-500 hover:text-indigo-600 p-1">✏️</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }} className="text-gray-500 hover:text-red-600 p-1">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;