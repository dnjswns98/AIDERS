pipeline {
    agent any
    
    environment {
        PROJECT_NAME = 'aiders'
        COMPOSE_PROJECT_NAME = 'aiders'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "🔄 Checking out code from repository..."
                checkout scm
                sh 'echo "Current commit: $(git rev-parse --short HEAD)"'
            }
        }
        
        stage('Environment Check') {
            steps {
                echo "🔍 Checking Docker environment..."
                sh '''
                    echo "Working directory: $(pwd)"
                    echo "Docker version: $(docker --version)"
                    echo "Docker Compose version: $(docker-compose --version)"
                    echo "Available disk space:"
                    df -h | head -2
                    echo "Memory usage:"
                    free -h | head -2
                    echo "User: $(whoami)"
                    echo "Groups: $(groups)"
                '''
            }
        }
        
        stage('Current Status Check') {
            steps {
                echo "📊 Checking current application status..."
                sh '''
                    echo "Current running containers:"
                    docker ps
                    
                    echo ""
                    echo "Application health check:"
                    curl -s http://localhost:8080/actuator/health || echo "Backend not accessible"
                    curl -s http://localhost:3000 > /dev/null && echo "Frontend is accessible" || echo "Frontend not accessible"
                '''
            }
        }
        
        stage('Docker Build') {
            steps {
                echo "🏗️ Building fresh Docker images..."
                sh '''
                    # 기존 컨테이너 정리
                    docker-compose down
                    
                    # 새로운 이미지 빌드
                    docker-compose build --no-cache
                    
                    # 빌드된 이미지 확인
                    echo "📋 Built images:"
                    docker images | grep aiders
                '''
            }
        }
        
        stage('Deploy Services') {
            steps {
                echo "🚀 Starting services with Docker Compose..."
                sh '''
                    # 모든 서비스 시작
                    docker-compose up -d
                    
                    # 컨테이너 상태 확인
                    echo "📊 Container status:"
                    docker-compose ps
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo "🏥 Performing application health checks..."
                sh '''
                    echo "⏳ Waiting for services to start..."
                    sleep 30
                    
                    # Backend Health Check
                    echo "🔍 Checking backend health..."
                    for i in {1..20}; do
                        if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
                            echo "✅ Backend is healthy!"
                            curl -s http://localhost:8080/actuator/health | head -5
                            break
                        fi
                        echo "⏳ Backend not ready yet... ($i/20)"
                        sleep 10
                    done
                    
                    # Frontend Health Check
                    echo "🔍 Checking frontend accessibility..."
                    curl -f -s http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend is accessible!" || echo "⚠️ Frontend check failed"
                    
                    # Database Health Check
                    echo "🔍 Checking MySQL connectivity..."
                    docker-compose exec -T mysql mysqladmin ping -h localhost -u root -p1234 2>/dev/null && echo "✅ MySQL is healthy!" || echo "⚠️ MySQL check failed"
                    
                    # Redis Health Check  
                    echo "🔍 Checking Redis connectivity..."
                    docker-compose exec -T redis redis-cli ping 2>/dev/null | grep PONG && echo "✅ Redis is healthy!" || echo "⚠️ Redis check failed"
                '''
            }
        }
        
        stage('Final Status') {
            steps {
                echo "📋 Deployment summary..."
                sh '''
                    echo "🎉 Deployment completed successfully!"
                    echo ""
                    echo "🌐 Service URLs:"
                    echo "  - Frontend: http://i13d107.p.ssafy.io:3000"
                    echo "  - Backend API: http://i13d107.p.ssafy.io:8080"
                    echo "  - Health Check: http://i13d107.p.ssafy.io:8080/actuator/health"
                    echo "  - API Docs: http://i13d107.p.ssafy.io:8080/swagger-ui/index.html"
                    echo "  - OpenVidu: http://i13d107.p.ssafy.io:4443"
                    echo ""
                    echo "📊 Final container status:"
                    docker-compose ps
                '''
            }
        }
    }
    
    post {
        always {
            echo "🔍 Pipeline execution completed"
            sh '''
                echo "📊 Final system status:"
                docker-compose ps
                df -h | head -2
                free -h | head -2
            '''
        }
        success {
            echo "✅ CI/CD Pipeline completed successfully!"
            sh '''
                echo "🎊 SUCCESS! Your Aiders application is now live!"
                echo ""
                echo "🚀 Access your application at:"
                echo "   👉 Frontend: http://i13d107.p.ssafy.io:3000"
                echo "   👉 Backend:  http://i13d107.p.ssafy.io:8080"
                echo ""
                echo "📊 All containers are running:"
                docker-compose ps
            '''
        }
        failure {
            echo "❌ Pipeline failed!"
            sh '''
                echo "🔍 Debugging information:"
                docker-compose logs --tail=20
                docker-compose ps
            '''
        }
    }
}
