document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const videoFile = document.getElementById('videoFile');
    const videoList = document.getElementById('videoList');
    const messageDiv = document.getElementById('message');
    const API_URL = '/api';
    
    // Carrega a lista de vídeos
    async function loadVideos() {
        try {
            const response = await fetch(`${API_URL}/videos`);
            const data = await response.json();
            
            if (data.success) {
                videoList.innerHTML = '';
                
                if (data.videos.length === 0) {
                    videoList.innerHTML = '<li>Nenhum vídeo encontrado</li>';
                    return;
                }
                
                data.videos.forEach(video => {
                    const li = document.createElement('li');
                    
                    const nameSpan = document.createElement('div');
                    nameSpan.textContent = video.name;
                    
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
        
        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }, 5000);
    }
    
    // Manipula o envio do formulário
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!videoFile.files.length) {
            showMessage('Por favor, selecione um vídeo para enviar', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('videoFile', videoFile.files[0]);
        
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
                loadVideos();
            } else {
                showMessage(`Erro: ${data.error}`, 'error');
            }
        } catch (error) {
            showMessage('Erro ao enviar o vídeo', 'error');
        }
    });
    
    // Carrega a lista inicial de vídeos
    loadVideos();
}); 