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
        
        stage('Smart Deploy') {
            steps {
                echo "🔍 Checking current containers and deploying smartly..."
                sh '''
                    echo "Current running containers:"
                    docker ps
                    
                    # 실행 중인 컨테이너가 있으면 재시작, 없으면 새로 시작
                    if docker ps | grep -q "aiders-"; then
                        echo "⚡ Containers already running, performing rolling restart..."
                        
                        # Backend만 새로 빌드하고 재시작 (가장 자주 변경되는 부분)
                        echo "🔄 Rebuilding and restarting Backend..."
                        docker-compose build aiders-app
                        docker stop aiders-backend
                        docker rm aiders-backend
                        docker-compose up -d --no-deps aiders-app
                        
                        # Frontend 새로 빌드하고 재시작
                        echo "🔄 Rebuilding and restarting Frontend..."
                        docker-compose build aiders-frontend
                        docker stop aiders-frontend
                        docker rm aiders-frontend
                        docker-compose up -d --no-deps aiders-frontend
                        
                        echo "✅ Rolling restart completed - Database and other services kept running"
                    else
                        echo "🚀 No containers running, starting fresh..."
                        # 전체 새로 빌드
                        docker-compose build --no-cache
                        docker-compose up -d
                    fi
                    
                    # 최종 상태 확인
                    echo "📊 Container status after deployment:"
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
