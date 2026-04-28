pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        // Variables de configuración
        REGISTRY = "docker.io"
        IMAGE_NAME = "tu-usuario/visitas-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        GIT_REPO = "https://github.com/tu-usuario/visitas_maps.git"
        DEPLOY_SERVER = "production.server.com"
        DEPLOY_USER = "deploy"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Clonando repositorio...'
                deleteDir()
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo '🏗️  Construyendo aplicación...'
                sh '''
                    docker run --rm \
                        --user "$(id -u):$(id -g)" \
                        -v "$PWD":/app \
                        -w /app \
                        node:18-alpine \
                        sh -lc "npm ci && npm run build"
                '''
            }
        }

        stage('Test') {
            steps {
                echo '✅ Ejecutando pruebas...'
                sh '''
                    # Aquí puedes añadir tus pruebas
                    # npm run test
                    echo "Tests completados"
                '''
            }
        }

        stage('SonarQube Analysis') {
            when {
                branch 'main'
            }
            steps {
                echo '🔍 Analizando código con SonarQube...'
                sh '''
                    sonar-scanner \
                        -Dsonar.projectKey=visitas-app \
                        -Dsonar.sources=src \
                        -Dsonar.host.url=http://sonarqube-server:9000 \
                        -Dsonar.login=${SONARQUBE_TOKEN}
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Construyendo imagen Docker...'
                sh '''
                    docker build \
                        -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                        -t ${REGISTRY}/${IMAGE_NAME}:latest \
                        .
                '''
            }
        }

        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                echo '📤 Subiendo imagen a registro...'
                withCredentials([usernamePassword(credentialsId: 'docker-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin ${REGISTRY}
                        docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${REGISTRY}/${IMAGE_NAME}:latest
                        docker logout ${REGISTRY}
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Desplegando a producción...'
                withCredentials([file(credentialsId: 'visitas-env-file', variable: 'VISITAS_ENV_FILE')]) {
                    sh '''
                        set -a
                        . "$VISITAS_ENV_FILE"
                        set +a

                        ssh -i /var/lib/jenkins/.ssh/deploy_key \
                            ${DEPLOY_USER}@${DEPLOY_SERVER} << EOF
                            
                        cd /opt/visitas-app

                        cat > .env <<ENVEOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_NAME=$DB_NAME
ENVEOF
                        
                        # Pull última versión
                        git pull origin main
                        
                        # Pull imagen Docker
                        docker pull ${REGISTRY}/${IMAGE_NAME}:latest
                        
                        # Detener contenedores actuales
                        docker-compose down
                        
                        # Iniciar nuevos contenedores
                        docker-compose up -d
                        
                        # Verificar salud
                        sleep 5
                        curl -f http://localhost:4322/api/supervisores || exit 1
                        
                        echo "✅ Despliegue completado exitosamente"
EOF
                    '''
                }
            }
        }

        stage('Update Cloudflare DNS') {
            when {
                branch 'main'
            }
            steps {
                echo '☁️  Actualizando Cloudflare...'
                sh '''
                    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${CLOUDFLARE_RECORD_ID}" \
                        -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
                        -H "X-Auth-Key: ${CLOUDFLARE_API_KEY}" \
                        -H "Content-Type: application/json" \
                        --data "{\"type\":\"A\",\"name\":\"visitas.tudominio.com\",\"content\":\"${DEPLOY_SERVER}\",\"ttl\":3600,\"proxied\":true}"
                '''
            }
        }

        stage('Smoke Tests') {
            when {
                branch 'main'
            }
            steps {
                echo '🧪 Ejecutando pruebas de humo...'
                sh '''
                    # Esperar a que la aplicación esté lista
                    for i in {1..30}; do
                        if curl -f http://${DEPLOY_SERVER}:4322/api/supervisores; then
                            echo "✅ Aplicación respondiendo"
                            break
                        fi
                        echo "Intento $i/30 - esperando aplicación..."
                        sleep 2
                    done
                    
                    # Verificar endpoints clave
                    curl -f http://${DEPLOY_SERVER}:4322/ || exit 1
                    curl -f http://${DEPLOY_SERVER}:4322/api/visitas || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completado exitosamente'
            // Aquí puedes añadir notificaciones (Slack, email, etc.)
        }

        failure {
            echo '❌ Pipeline falló'
            // Notificar del error
        }

        always {
            echo '🧹 Limpieza finalizada'
        }
    }
}
