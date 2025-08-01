pipeline {
    agent any
    
    environment {
        PROJECT_NAME = 'aiders'
        BACKEND_DIR = 'aiders-backend'
        FRONTEND_DIR = 'aiders-frontend'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "🔄 Checking out code from develop branch..."
                checkout scm
            }
        }
        
        stage('Environment Check') {
            steps {
                echo "🔍 Checking build environment..."
                sh '''
                    echo "Current directory: $(pwd)"
                    echo "Java version: $(java -version)"
                    echo "Node version: $(node --version)"
                    echo "Docker version: $(docker --version)"
                    echo "Docker Compose version: $(docker-compose --version)"
                '''
            }
        }
        
        stage('Build & Test') {
            parallel {
                stage('Backend Build') {
                    steps {
                        echo "🏗️ Building Spring Boot application..."
                        dir(BACKEND_DIR) {
                            sh '''
                                chmod +x gradlew
                                ./gradlew clean build -x test --no-daemon
                            '''
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        echo "🏗️ Building React application..."
                        dir(FRONTEND_DIR) {
                            sh '''
                                npm ci --silent
                                npm run build
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                echo "🐳 Building Docker images..."
                sh '''
                    docker-compose build --no-cache
                    docker images | grep aiders
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                echo "🚀 Deploying application..."
                sh '''
                    # 기존 컨테이너 정리
                    docker-compose down || true
                    
                    # 새 컨테이너 실행
                    docker-compose up -d
                    
                    # 컨테이너 상태 확인
                    sleep 10
                    docker-compose ps
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo "🏥 Performing health checks..."
                sh '''
                    # Backend Health Check
                    for i in {1..30}; do
                        if curl -f http://localhost:8080/actuator/health; then
                            echo "✅ Backend is healthy"
                            break
                        fi
                        echo "⏳ Waiting for backend... ($i/30)"
                        sleep 10
                    done
                    
                    # Frontend Health Check
                    if curl -f http://localhost:3000; then
                        echo "✅ Frontend is accessible"
                    else
                        echo "❌ Frontend health check failed"
                        exit 1
                    fi
                '''
            }
        }
    }
    
    post {
        always {
            echo "🧹 Cleaning up..."
            sh '''
                # 사용하지 않는 Docker 이미지 정리
                docker system prune -f
            '''
        }
        success {
            echo "✅ Pipeline completed successfully!"
            echo "🌐 Application is running at:"
            echo "   - Frontend: http://i13d107.p.ssafy.io:3000"
            echo "   - Backend: http://i13d107.p.ssafy.io:8080"
            echo "   - API Docs: http://i13d107.p.ssafy.io:8080/swagger-ui/index.html"
        }
        failure {
            echo "❌ Pipeline failed!"
            sh '''
                echo "📊 Container status:"
                docker-compose ps
                echo "📋 Recent logs:"
                docker-compose logs --tail=50
            '''
        }
    }
}
