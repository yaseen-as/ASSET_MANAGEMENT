pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-docker-registry'
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
        COMPOSE_PROJECT_NAME = 'asset-manager'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    // Load environment variables based on branch
                    if (env.BRANCH_NAME == 'main') {
                        env.NODE_ENV = 'production'
                        env.COMPOSE_PROFILES = 'prod'
                    } else if (env.BRANCH_NAME == 'develop') {
                        env.NODE_ENV = 'development'
                        env.COMPOSE_PROFILES = 'dev'
                    } else {
                        env.NODE_ENV = 'test'
                        env.COMPOSE_PROFILES = 'test'
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Auth Service') {
                    steps {
                        dir('services/auth') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Portfolio Service') {
                    steps {
                        dir('services/portfolio') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Market Service') {
                    steps {
                        dir('services/market-data') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Lint & Code Quality') {
            parallel {
                stage('Auth Service Lint') {
                    steps {
                        dir('services/auth') {
                            sh 'npm run lint'
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'services/auth/reports',
                                reportFiles: 'eslint-report.html',
                                reportName: 'Auth Service ESLint Report'
                            ])
                        }
                    }
                }
                stage('Portfolio Service Lint') {
                    steps {
                        dir('services/portfolio') {
                            sh 'npm run lint'
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'services/portfolio/reports',
                                reportFiles: 'eslint-report.html',
                                reportName: 'Portfolio Service ESLint Report'
                            ])
                        }
                    }
                }
                stage('Market Service Lint') {
                    steps {
                        dir('services/market-data') {
                            sh 'npm run lint'
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'services/market-data/reports',
                                reportFiles: 'eslint-report.html',
                                reportName: 'Market Service ESLint Report'
                            ])
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint'
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/reports',
                                reportFiles: 'eslint-report.html',
                                reportName: 'Frontend ESLint Report'
                            ])
                        }
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            parallel {
                stage('Auth Service Tests') {
                    steps {
                        dir('services/auth') {
                            sh 'npm run test:unit'
                        }
                    }
                    post {
                        always {
                            publishTestResults([
                                testResultsPattern: 'services/auth/reports/jest-junit.xml'
                            ])
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'services/auth/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Auth Service Coverage Report'
                            ])
                        }
                    }
                }
                stage('Portfolio Service Tests') {
                    steps {
                        dir('services/portfolio') {
                            sh 'npm run test:unit'
                        }
                    }
                    post {
                        always {
                            publishTestResults([
                                testResultsPattern: 'services/portfolio/reports/jest-junit.xml'
                            ])
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'services/portfolio/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Portfolio Service Coverage Report'
                            ])
                        }
                    }
                }
                stage('Market Service Tests') {
                    steps {
                        dir('services/market-data') {
                            sh 'npm run test:unit'
                        }
                    }
                    post {
                        always {
                            publishTestResults([
                                testResultsPattern: 'services/market-data/reports/jest-junit.xml'
                            ])
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'services/market-data/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Market Service Coverage Report'
                            ])
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm run test -- --coverage --watchAll=false'
                        }
                    }
                    post {
                        always {
                            publishTestResults([
                                testResultsPattern: 'frontend/reports/jest-junit.xml'
                            ])
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    // Build all service images
                    sh """
                        docker build -t ${DOCKER_REGISTRY}/auth-service:${IMAGE_TAG} ./services/auth
                        docker build -t ${DOCKER_REGISTRY}/portfolio-service:${IMAGE_TAG} ./services/portfolio
                        docker build -t ${DOCKER_REGISTRY}/market-service:${IMAGE_TAG} ./services/market-data
                        docker build -t ${DOCKER_REGISTRY}/frontend:${IMAGE_TAG} ./frontend
                        docker build -t ${DOCKER_REGISTRY}/nginx:${IMAGE_TAG} ./nginx
                    """
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    sh """
                        # Start test environment
                        docker-compose --profile test up -d --build
                        
                        # Wait for services to be ready
                        sleep 30
                        
                        # Run integration tests
                        docker-compose exec -T auth-service npm run test:integration
                        docker-compose exec -T portfolio-service npm run test:integration
                        docker-compose exec -T market-service npm run test:integration
                    """
                }
            }
            post {
                always {
                    sh 'docker-compose --profile test down -v'
                    publishTestResults([
                        testResultsPattern: '**/reports/integration-test-results.xml'
                    ])
                }
            }
        }
        
        stage('E2E Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    sh """
                        # Start full environment
                        docker-compose --profile test up -d --build
                        
                        # Wait for services to be ready
                        sleep 45
                        
                        # Run E2E tests
                        docker-compose run --rm e2e-tests npm run test:e2e
                    """
                }
            }
            post {
                always {
                    sh 'docker-compose --profile test down -v'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'e2e/reports',
                        reportFiles: 'index.html',
                        reportName: 'E2E Test Report'
                    ])
                }
            }
        }
        
        stage('Security Scan') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            parallel {
                stage('Dependency Audit') {
                    steps {
                        sh """
                            cd services/auth && npm audit --audit-level=high
                            cd services/portfolio && npm audit --audit-level=high
                            cd services/market-data && npm audit --audit-level=high
                            cd frontend && npm audit --audit-level=high
                        """
                    }
                }
                stage('Docker Image Scan') {
                    steps {
                        sh """
                            # Scan Docker images for vulnerabilities
                            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                                anchore/grype ${DOCKER_REGISTRY}/auth-service:${IMAGE_TAG}
                        """
                    }
                }
            }
        }
        
        stage('Push Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    sh """
                        # Push images to registry
                        docker push ${DOCKER_REGISTRY}/auth-service:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/portfolio-service:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/market-service:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/frontend:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/nginx:${IMAGE_TAG}
                        
                        # Tag latest for main branch
                        if [ "${BRANCH_NAME}" = "main" ]; then
                            docker tag ${DOCKER_REGISTRY}/auth-service:${IMAGE_TAG} ${DOCKER_REGISTRY}/auth-service:latest
                            docker tag ${DOCKER_REGISTRY}/portfolio-service:${IMAGE_TAG} ${DOCKER_REGISTRY}/portfolio-service:latest
                            docker tag ${DOCKER_REGISTRY}/market-service:${IMAGE_TAG} ${DOCKER_REGISTRY}/market-service:latest
                            docker tag ${DOCKER_REGISTRY}/frontend:${IMAGE_TAG} ${DOCKER_REGISTRY}/frontend:latest
                            docker tag ${DOCKER_REGISTRY}/nginx:${IMAGE_TAG} ${DOCKER_REGISTRY}/nginx:latest
                            
                            docker push ${DOCKER_REGISTRY}/auth-service:latest
                            docker push ${DOCKER_REGISTRY}/portfolio-service:latest
                            docker push ${DOCKER_REGISTRY}/market-service:latest
                            docker push ${DOCKER_REGISTRY}/frontend:latest
                            docker push ${DOCKER_REGISTRY}/nginx:latest
                        fi
                    """
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh """
                        # Deploy to production
                        echo "Deploying to production environment..."
                        
                        # Update docker-compose with new image tags
                        sed -i 's/:latest/:${IMAGE_TAG}/g' docker-compose.prod.yml
                        
                        # Deploy
                        docker-compose -f docker-compose.prod.yml --profile prod up -d --build
                        
                        # Health check
                        sleep 30
                        curl -f http://localhost/health || exit 1
                    """
                }
            }
        }
    }
    
    post {
        always {
            // Clean up
            sh '''
                docker system prune -f
                docker volume prune -f
            '''
        }
        success {
            emailext (
                subject: "✅ Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                <h2>Build Successful</h2>
                <p><strong>Project:</strong> ${env.JOB_NAME}</p>
                <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                <p><strong>Build URL:</strong> ${env.BUILD_URL}</p>
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        failure {
            emailext (
                subject: "❌ Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                <h2>Build Failed</h2>
                <p><strong>Project:</strong> ${env.JOB_NAME}</p>
                <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                <p><strong>Build URL:</strong> ${env.BUILD_URL}</p>
                <p><strong>Console Output:</strong> ${env.BUILD_URL}console</p>
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
