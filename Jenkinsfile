pipeline {
    agent {
        docker {
                image 'node:16.13.1-alpine'
                args '--tmpfs /.config'
              }
    }
    stages {
        stage('Install') {
            steps {
                sh 'node --version'
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run release'
            }
        }
    }
}
