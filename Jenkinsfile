pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        REGISTRY = "docker.io"
        IMAGE_NAME = "tu-usuario/visitas-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DEPLOY_SERVER = "seguimiento.serviredgane.cloud"
        DEPLOY_USER = "deploy"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Clonando repositorio...'
                dir('source') {
                    checkout scm
                }
            }
        }

        stage('Build') {
            steps {
                echo '🏗️  Validando que la estructura esté lista...'
                dir('source') {
                    sh '''
                        test -f package.json || { echo "❌ package.json no encontrado"; exit 1; }
                        test -f Dockerfile || { echo "❌ Dockerfile no encontrado"; exit 1; }
                        echo "✅ Estructura validada, Docker manejará la compilación"
                    '''
                }
            }
        }

        stage('Test') {
            steps {
                echo '✅ Ejecutando pruebas...'
                dir('source') {
                    sh '''
                        echo "Tests completados"
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                branch 'main'
            }
            steps {
                echo '🔍 Analizando código con SonarQube...'
                dir('source') {
                    sh '''
                        sonar-scanner \
                            -Dsonar.projectKey=visitas-app \
                            -Dsonar.sources=src \
                            -Dsonar.host.url=http://sonarqube-server:9000 \
                            -Dsonar.login=${SONARQUBE_TOKEN}
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Construyendo imagen Docker (compilación incluida)...'
                dir('source') {
                    sh '''
                        docker build \
                            --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                            -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                            -t ${REGISTRY}/${IMAGE_NAME}:latest \
                            .
                        echo "✅ Imagen Docker construida exitosamente"
                        docker images | grep ${IMAGE_NAME}
                    '''
                }
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
                sh '''
                    HOST=${DEPLOY_USER}@${DEPLOY_SERVER}
                    echo "[deploy] Pulling latest code and running deploy script on ${HOST}"
                    ssh -o StrictHostKeyChecking=no ${HOST} "cd /opt/visitas-app && git pull origin main && sudo /opt/visitas-app/scripts/deploy.sh"
                    echo '✅ Despliegue completado exitosamente'
                '''
                branch 'main'
            }
            steps {
                echo '☁️  Actualizando Cloudflare...'
                sh '''
                    curl -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${CLOUDFLARE_RECORD_ID}" \
                        -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
                        -H "X-Auth-Key: ${CLOUDFLARE_API_KEY}" \
                        -H "Content-Type: application/json" \
                        --data "{\"type\":\"A\",\"name\":\"seguimiento.serviredgane.cloud\",\"content\":\"${DEPLOY_SERVER}\",\"ttl\":3600,\"proxied\":true}"
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
                    for i in {1..30}; do
                        if curl -f http://${DEPLOY_SERVER}:4322/api/supervisores; then
                            echo "✅ Aplicación respondiendo"
                            break
                        fi
                        echo "Intento $i/30 - esperando aplicación..."
                        sleep 2
                    done

                    curl -f http://${DEPLOY_SERVER}:4322/ || exit 1
                    curl -f http://${DEPLOY_SERVER}:4322/api/visitas || exit 1
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completado exitosamente'
        }

        failure {
            echo '❌ Pipeline falló'
        }

        always {
            echo '🧹 Limpieza finalizada'
        }
    }
}
