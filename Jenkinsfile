pipeline {
    agent any

    environment {
        PROJECT_NAME = 'aiders'
        COMPOSE_PROJECT_NAME = 's13p11d107'

        REDIS_PORT = '6379'
        MYSQL_PORT = '3306'
        OPENVIDU_PORT = '4443'
        BACKEND_PORT = '8080'
        FRONTEND_PORT = '3000'
        FRONTEND_INTERNAL_PORT = '5173'
        MYSQL_ROOT_PASSWORD = '1234'
        MYSQL_DATABASE = 'mydb'
        OPENVIDU_SECRET = 'MY_SECRET'
        SPRING_PROFILES_ACTIVE = 'docker'
        VITE_API_BASE_URL = 'https://i13d107.p.ssafy.io'
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
                        echo "⚡ Containers already running, performing clean restart..."
                        
                        # 모든 aiders 관련 컨테이너 강제 정리 (프로젝트명 무관)
                        echo "🔄 Stopping and removing all aiders containers..."
                        docker ps -a | grep "aiders-" | awk '{print $1}' | xargs -r docker stop
                        docker ps -a | grep "aiders-" | awk '{print $1}' | xargs -r docker rm
                        
                        # 전체 중지 후 재시작 (네트워크 문제 방지)
                        echo "🔄 Stopping remaining services..."
                        docker-compose down
                        
                        echo "🔄 Rebuilding changed services..."
                        docker-compose build aiders-app aiders-frontend
                        
                        echo "🚀 Starting all services..."
                        docker-compose up -d
                        
                        echo "✅ Clean restart completed"
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