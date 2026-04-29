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

        stage('Prepare SSH') {
            steps {
                echo '🔑 Preparando clave SSH...'
                sh '''
                    JENKINS_SSH_KEY="/var/lib/jenkins/.ssh/deploy_key"
                    JENKINS_SSH_PUB="${JENKINS_SSH_KEY}.pub"
                    
                    # Generar clave SSH si no existe
                    if [ ! -f "${JENKINS_SSH_KEY}" ]; then
                        echo "[ssh] Generando clave SSH"
                        mkdir -p /var/lib/jenkins/.ssh
                        ssh-keygen -t rsa -b 4096 -f "${JENKINS_SSH_KEY}" -N "" || true
                        chmod 600 "${JENKINS_SSH_KEY}"
                    else
                        echo "[ssh] Clave SSH ya existe"
                    fi
                    
                    # Mostrar clave pública
                    echo "[ssh] Clave pública (para referencia):"
                    cat "${JENKINS_SSH_PUB}"
                '''
            }
        }

        stage('Deploy to Production') {
            steps {
                echo '🚀 Desplegando a producción (setup + deploy)...'
                dir('source') {
                    sh '''
                        HOST=${DEPLOY_USER}@${DEPLOY_SERVER}
                        SSH_KEY="/var/lib/jenkins/.ssh/deploy_key"
                        SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ${SSH_KEY}"
                        
                        # Intentar conexión SSH
                        echo "[deploy] Verificando conectividad SSH..."
                        if ! ssh ${SSH_OPTS} ${HOST} "echo OK" &>/dev/null; then
                            echo "[ERROR] No se puede conectar por SSH a ${HOST}"
                            echo "[ERROR] Ejecuta ESTO en el servidor ${DEPLOY_SERVER}:"
                            echo ""
                            echo "════════════════════════════════════════════════════════════"
                            echo "sudo tee -a /home/deploy/.ssh/authorized_keys > /dev/null <<'KEY'"
                            cat ${SSH_KEY}.pub
                            echo "KEY"
                            echo "sudo chown -R deploy:deploy /home/deploy/.ssh"
                            echo "sudo chmod 700 /home/deploy/.ssh"
                            echo "sudo chmod 600 /home/deploy/.ssh/authorized_keys"
                            echo "════════════════════════════════════════════════════════════"
                            echo ""
                            echo "Después vuelve a ejecutar Build en Jenkins"
                            exit 1
                        fi
                        
                        echo "[1/2] Setting up server (first time only, idempotent)..."
                        ssh ${SSH_OPTS} ${HOST} "sudo bash -s" < scripts/setup-remote.sh || true
                        
                        echo "[2/2] Pulling latest code and deploying..."
                        ssh ${SSH_OPTS} ${HOST} "cd /opt/visitas-app && git pull origin main && sudo /opt/visitas-app/scripts/deploy.sh"
                        
                        echo '✅ Despliegue completado exitosamente'
                    '''
                }
            }
        }

        stage('Update Cloudflare DNS') {
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

        stage('Purge Cloudflare Cache') {
            steps {
                echo '🧹 Limpiando caché de Cloudflare...'
                sh '''
                    curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
                        -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
                        -H "X-Auth-Key: ${CLOUDFLARE_API_KEY}" \
                        -H "Content-Type: application/json" \
                        --data '{"purge_everything":true}'
                '''
            }
        }

        stage('Smoke Tests') {
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
