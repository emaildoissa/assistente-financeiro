
# 1. Fazer login no Docker Hub (insira seu usuário e senha quando solicitado)
docker login

# 2. Entrar na pasta da API onde está o Dockerfile
cd apps\api

# 3. Fazer o build da imagem -> raiz do programa 
docker build -t emaildoissa/assessor-api:latest -f apps/api/Dockerfile .

# 4. Enviar (push) a imagem para o Docker Hub
docker push emaildoissa/assessor-api:latest

# 5. Voltar para a pasta raiz (opcional)
cd ..\..
