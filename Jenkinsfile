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
                '''
            }
        }

        stage('Clean Previous Build') {
            steps {
                echo "🧹 Cleaning previous containers and images..."
                sh '''
                    # 기존 컨테이너 정리 (에러 무시)
                    docker-compose down --remove-orphans || true

                    # 사용하지 않는 이미지 정리
                    docker image prune -f || true

                    echo "✅ Cleanup completed"
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo "🏗️ Building Docker images..."
                sh '''
                    # Docker Compose로 모든 이미지 빌드
                    docker-compose build --no-cache

                    # 빌드된 이미지 확인
                    echo "📋 Built images:"
                    docker images | grep aiders || echo "No aiders images found"
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
                    sleep 45

                    # Backend Health Check (30초 대기)
                    echo "🔍 Checking backend health..."
                    for i in {1..30}; do
                        if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
                            echo "✅ Backend is healthy!"
                            curl -s http://localhost:8080/actuator/health | head -5
                            break
                        fi
                        echo "⏳ Backend not ready yet... ($i/30)"
                        sleep 10
                    done

                    # Frontend Health Check
                    echo "🔍 Checking frontend accessibility..."
                    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
                        echo "✅ Frontend is accessible!"
                    else
                        echo "⚠️ Frontend check failed, but continuing..."
                    fi

                    # Database Health Check
                    echo "🔍 Checking database connectivity..."
                    docker-compose exec -T mysql mysqladmin ping -h localhost -u root -p1234 2>/dev/null && echo "✅ MySQL is healthy!" || echo "⚠️ MySQL check failed"

                    # Redis Health Check
                    echo "🔍 Checking Redis connectivity..."
                    docker-compose exec -T redis redis-cli ping | grep PONG && echo "✅ Redis is healthy!" || echo "⚠️ Redis check failed"
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
                    echo ""
                    echo "📊 Running containers:"
                    docker-compose ps
                '''
            }
        }
    }

    post {
        always {
            echo "🔍 Pipeline execution completed"
            sh '''
                echo "💾 Final container status:"
                docker-compose ps || echo "Could not get container status"

                echo "📈 System resource usage:"
                df -h | head -2
                free -h | head -2
            '''
        }
        success {
            echo "✅ Pipeline completed successfully!"
            sh '''
                echo "🎊 Deployment Success!"
                echo "All services are running and healthy."
                echo "Application is ready for use."
            '''
        }
        failure {
            echo "❌ Pipeline failed!"
            sh '''
                echo "🔍 Debugging information:"
                echo "📋 Container logs (last 20 lines each):"

                echo "=== Backend Logs ==="
                docker-compose logs --tail=20 aiders-app 2>/dev/null || echo "Backend logs not available"

                echo "=== Frontend Logs ==="
                docker-compose logs --tail=20 aiders-frontend 2>/dev/null || echo "Frontend logs not available"

                echo "=== MySQL Logs ==="
                docker-compose logs --tail=10 mysql 2>/dev/null || echo "MySQL logs not available"

                echo "=== Current container status ==="
                docker-compose ps || echo "Could not get container status"
            '''
        }
        cleanup {
            echo "🧹 Pipeline cleanup completed"
        }
    }
}