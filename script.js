document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const videoFile = document.getElementById('videoFile');
    const videoList = document.getElementById('videoList');
    const messageDiv = document.getElementById('message');
    const usedSpaceElement = document.getElementById('usedSpace');
    const availableSpaceElement = document.getElementById('availableSpace');
    
    const API_URL = '/api';
    
    // Constantes de limite
    const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // 3GB em bytes
    const MAX_TOTAL_STORAGE = 999 * 1024 * 1024 * 1024; // 999GB em bytes
    
    // Formata o tamanho em bytes para uma string legível
    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Atualiza as estatísticas de armazenamento
    function updateStorageStats(usedSpace) {
        usedSpaceElement.textContent = formatSize(usedSpace);
        availableSpaceElement.textContent = formatSize(MAX_TOTAL_STORAGE - usedSpace);
        
        // Verifica se está próximo do limite e avisa o usuário
        if (usedSpace > MAX_TOTAL_STORAGE * 0.9) {
            showMessage(`Atenção: O armazenamento está quase cheio (${Math.round(usedSpace / MAX_TOTAL_STORAGE * 100)}%)`, 'warning');
        }
    }
    
    // Carrega a lista de vídeos
    async function loadVideos() {
        try {
            const response = await fetch(`${API_URL}/videos`);
            const data = await response.json();
            
            if (data.success) {
                // Atualiza estatísticas de armazenamento
                updateStorageStats(data.totalSize || 0);
                
                videoList.innerHTML = '';
                
                if (data.videos.length === 0) {
                    videoList.innerHTML = '<li>Nenhum vídeo encontrado</li>';
                    return;
                }
                
                data.videos.forEach(video => {
                    const li = document.createElement('li');
                    
                    const nameSpan = document.createElement('div');
                    nameSpan.textContent = `${video.name} (${formatSize(video.size)})`;
                    
                    const buttonDiv = document.createElement('div');
                    buttonDiv.className = 'button-group';
                    
                    const viewButton = document.createElement('button');
                    viewButton.textContent = 'Visualizar';
                    viewButton.addEventListener('click', () => {
                        window.open(video.url);
                    });
                    
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Excluir';
                    deleteButton.className = 'delete-btn';
                    deleteButton.addEventListener('click', async () => {
                        if (confirm('Tem certeza que deseja excluir este vídeo?')) {
                            try {
                                const response = await fetch(`${API_URL}/videos/${video.name}`, {
                                    method: 'DELETE'
                                });
                                const data = await response.json();
                                
                                if (data.success) {
                                    showMessage('Vídeo excluído com sucesso!', 'success');
                                    updateStorageStats(data.totalSize);
                                    loadVideos();
                                }
                            } catch (error) {
                                showMessage('Erro ao excluir o vídeo', 'error');
                            }
                        }
                    });
                    
                    buttonDiv.appendChild(viewButton);
                    buttonDiv.appendChild(deleteButton);
                    
                    li.appendChild(nameSpan);
                    li.appendChild(buttonDiv);
                    videoList.appendChild(li);
                });
            }
        } catch (error) {
            showMessage('Erro ao carregar vídeos', 'error');
        }
    }
    
    // Exibe mensagens
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type;
        
        // Remove a mensagem após 5 segundos para tipos que não são avisos
        if (type !== 'warning') {
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = '';
            }, 5000);
        }
    }
    
    // Manipula o envio do formulário
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!videoFile.files.length) {
            showMessage('Por favor, selecione um vídeo para enviar', 'error');
            return;
        }
        
        const file = videoFile.files[0];
        
        // Verifica o tamanho do arquivo
        if (file.size > MAX_FILE_SIZE) {
            showMessage(`Erro: O tamanho do arquivo excede o limite de ${formatSize(MAX_FILE_SIZE)}`, 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('videoFile', file);
        
        try {
            showMessage('Enviando vídeo...', '');
            
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Upload concluído com sucesso!', 'success');
                videoFile.value = '';
                updateStorageStats(data.totalSize);
                loadVideos();
            } else {
                showMessage(`Erro: ${data.error}`, 'error');
            }
        } catch (error) {
            showMessage('Erro ao enviar o vídeo', 'error');
        }
    });
    
    // Verifica o tamanho do arquivo quando selecionado
    videoFile.addEventListener('change', () => {
        if (videoFile.files.length > 0) {
            const file = videoFile.files[0];
            if (file.size > MAX_FILE_SIZE) {
                showMessage(`Atenção: O arquivo excede o limite de ${formatSize(MAX_FILE_SIZE)}`, 'error');
                videoFile.value = '';
            }
        }
    });
    
    // Carrega a lista inicial de vídeos
    loadVideos();
}); 